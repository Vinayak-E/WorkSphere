import Stripe from 'stripe';
import slugify from 'slugify';
import { injectable, inject } from 'tsyringe';
import { Messages } from '../../constants/messages';
import { HttpStatus } from '../../constants/httpStatus';
import { Request, Response, NextFunction } from 'express';
import { connectTenantDB } from '../../configs/db.config';
import { CompanyService } from '../../services/Implementation/company.service';
import { ISubscriptionService } from '../../services/Interface/ISubscriptionService';
import { PaymentRepository } from '../../repositories/Implementation/payment.repository';

@injectable()
export class CheckoutController {
  private stripe: Stripe;

  constructor(
    @inject('SubscriptionService')
    private subscriptionService: ISubscriptionService,
    @inject('CompanyService') private companyService: CompanyService,
    @inject('PaymentRepository') private paymentRepository: PaymentRepository
  ) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error(
        'STRIPE_SECRET_KEY is not defined in environment variables'
      );
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-02-24.acacia',
    });
  }

  createCheckoutSession = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { planId, billingInterval } = req.body;
      const companyEmail = req.user?.email;
      const tenantConnection = req.tenantConnection;

      if (!tenantConnection) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({
            success: false,
            message: Messages.TENANT_CONNECTION_ERROR,
          });
        return;
      }
      if (!planId || !companyEmail) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message:  Messages.MISSING_FIELDS,
        });
        return;
      }

      const { subscriptions } = await this.subscriptionService.getSubscriptions(
        { _id: planId },
        1,
        1
      );

      if (!subscriptions || subscriptions.length === 0) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: Messages.SUBSCRIPTION_NOT_FOUND,
        });
        return;
      }

      const plan = subscriptions[0];

      const company = await this.companyService.getCompanyByEmail(
        companyEmail,
        tenantConnection
      );
      if (!company) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: Messages.COMPANY_NOT_FOUND,
        });
        return;
      }

      const companyId = company._id;
      const tenantId = slugify(company.companyName).toUpperCase();
      let priceAmount = plan.price;

      if (billingInterval === 'yearly') {
        priceAmount = plan.price * plan.durationInMonths * 0.9;
      }
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: plan.planName,
                description: plan.description,
              },
              unit_amount: Math.round(priceAmount * 100),
              recurring:
                billingInterval === 'yearly'
                  ? undefined
                  : {
                      interval: 'month',
                    },
            },
            quantity: 1,
          },
        ],
        mode: billingInterval === 'yearly' ? 'payment' : 'subscription',
        success_url: `${process.env.CLIENT_URL}/company/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/company/select-plan`,
        customer_email: company.email,
        metadata: {
          companyId: companyId.toString(),
          tenantId: tenantId,
          planId: planId,
          planName: plan.planName,
          billingInterval: billingInterval,
          amount: priceAmount.toString(),
        },
      });

      res.status(HttpStatus.OK).json({
        success: true,
        sessionId: session.id,
      });
    } catch (error) {
      next(error);
    }
  };

  handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
    console.log('webhook triggered');
    const sig = req.headers['stripe-signature'];
    if (!sig) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: Messages.MISSING_FIELDS });
      return;
    }

    let event;
    try {
      const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!stripeWebhookSecret) {
        throw new Error(
          Messages.STRIPE_WEBHOOK_SECRET_MISSING
        );
      }

      event = this.stripe.webhooks.constructEvent(
        req.body,
        sig,
        stripeWebhookSecret
      );
    } catch (error) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({
          success: false,
          message: Messages.WEBHOOK_VERIFICATION_FAILED,
        });
      return;
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          if (!session.metadata) {
            throw new Error(Messages.METADATA_MISSING);
          }

          const {
            companyId,
            tenantId,
            planId,
            planName,
            billingInterval,
            amount,
          } = session.metadata;

          await this.paymentRepository.create({
            companyId,
            tenantId,
            planId,
            planName,
            amount: parseFloat(amount),
            currency: 'usd',
            paymentMethod: 'card',
            stripeSessionId: session.id,
            stripeSubscriptionId:
              typeof session.subscription === 'string'
                ? session.subscription
                : undefined,
            billingInterval: billingInterval as 'monthly' | 'yearly',
            status: 'succeeded',
            paymentDate: new Date(),
          });

          const tenantConnection = await connectTenantDB(tenantId);
          if (!tenantConnection) {
            throw new Error(
              `Failed to connect to tenant database for tenantId: ${tenantId}`
            );
          }
          const { subscriptions } =
            await this.subscriptionService.getSubscriptions(
              { _id: planId },
              1,
              1
            );
          if (!subscriptions || subscriptions.length === 0) {
            throw new Error(Messages.SUBSCRIPTION_NOT_FOUND);
          }

          const plan = subscriptions[0];
          const startDate = new Date();
          let endDate = new Date(startDate);

          if (billingInterval === 'yearly') {
            endDate.setMonth(endDate.getMonth() + plan.durationInMonths);
          } else {
            endDate.setMonth(endDate.getMonth() + 1);
          }

          await this.companyService.updateCompanySubscription(
            companyId,
            {
              subscriptionPlan: planId,
              subscriptionStartDate: startDate,
              subscriptionEndDate: endDate,
              subscriptionStatus: 'Active',
            },
            tenantConnection
          );
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object;
          if (invoice.subscription) {
            if (typeof invoice.subscription !== 'string') {
              throw new Error(Messages.INVALID_SUBSCRIPTION_ID);
            }

            const subscription = await this.stripe.subscriptions.retrieve(
              invoice.subscription
            );
            const { companyId, tenantId, planId, planName } =
              subscription.metadata;

            await this.paymentRepository.create({
              companyId,
              tenantId,
              planId,
              planName,
              amount: invoice.amount_paid / 100,
              currency: invoice.currency,
              paymentMethod: 'card',
              stripeSessionId: invoice.id,
              stripeInvoiceId: invoice.id,
              stripeSubscriptionId: invoice.subscription,
              billingInterval: 'monthly',
              status: 'succeeded',
              paymentDate: new Date(invoice.created * 1000),
            });

            const tenantConnection = await connectTenantDB(tenantId);
            if (!tenantConnection) {
              throw new Error(
                `Failed to connect to tenant database for tenantId: ${tenantId}`
              );
            }

            const company = await this.companyService.getCompanyById(
              companyId,
              tenantConnection
            );
            if (company && company.subscriptionEndDate) {
              const newEndDate = new Date(company.subscriptionEndDate);
              newEndDate.setMonth(newEndDate.getMonth() + 1);
              await this.companyService.updateCompanySubscription(
                companyId,
                {
                  subscriptionEndDate: newEndDate,
                  subscriptionStatus: 'Active',
                },
                tenantConnection
              );
            }
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          const { companyId, tenantId } = subscription.metadata;

          const tenantConnection = await connectTenantDB(tenantId);
          if (!tenantConnection) {
            throw new Error(
              `Failed to connect to tenant database for tenantId: ${tenantId}`
            );
          }

          await this.companyService.updateCompanySubscription(
            companyId,
            { subscriptionStatus: 'Inactive' },
            tenantConnection
          );
          break;
        }
      }
      res.status(HttpStatus.OK).json({ received: true });
    } catch (error) {
      next(error);
    }
  };

  handlePaymentSuccess = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { session_id } = req.query;
      if (!session_id) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: Messages.MISSING_SESSION_ID});
        return;
      }

      const session = await this.stripe.checkout.sessions.retrieve(
        session_id as string
      );
      if (!session) {
        res.status(HttpStatus.NOT_FOUND).json({ success: false, message: Messages.SESSION_NOT_FOUND });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          status: session.payment_status,
          customerEmail: session.customer_details?.email,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
