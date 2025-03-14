import Stripe from 'stripe';
import slugify from 'slugify';
import { injectable, inject } from 'tsyringe';
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
          .status(500)
          .json({
            success: false,
            message: 'Tenant connection not established',
          });
        return;
      }
      if (!planId || !companyEmail) {
        res.status(400).json({
          success: false,
          message: 'Missing required parameters',
        });
        return;
      }

      const { subscriptions } = await this.subscriptionService.getSubscriptions(
        { _id: planId },
        1,
        1
      );

      if (!subscriptions || subscriptions.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Subscription plan not found',
        });
        return;
      }

      const plan = subscriptions[0];

      const company = await this.companyService.getCompanyByEmail(
        companyEmail,
        tenantConnection
      );
      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Company not found',
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

      res.status(200).json({
        success: true,
        sessionId: session.id,
      });
    } catch (error) {
      console.error('Checkout error:', error);
      next(error);
    }
  };

  handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
    console.log('webhook triggered');
    const sig = req.headers['stripe-signature'];
    if (!sig) {
      res
        .status(400)
        .json({ success: false, message: 'Missing Stripe signature' });
      return;
    }

    let event;
    try {
      const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!stripeWebhookSecret) {
        throw new Error(
          'STRIPE_WEBHOOK_SECRET is not defined in environment variables'
        );
      }

      event = this.stripe.webhooks.constructEvent(
        req.body,
        sig,
        stripeWebhookSecret
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      res
        .status(400)
        .json({
          success: false,
          message: 'Webhook signature verification failed',
        });
      return;
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          if (!session.metadata) {
            throw new Error('Metadata is missing in the Stripe session');
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

          console.log('session metadata', session.metadata);
          const { subscriptions } =
            await this.subscriptionService.getSubscriptions(
              { _id: planId },
              1,
              1
            );
          if (!subscriptions || subscriptions.length === 0) {
            throw new Error('Subscription plan not found');
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
              throw new Error('Invalid subscription ID');
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
      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook processing error:', error);
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
      console.log('handlePayment success', session_id);
      if (!session_id) {
        res.status(400).json({ success: false, message: 'Missing session ID' });
        return;
      }

      const session = await this.stripe.checkout.sessions.retrieve(
        session_id as string
      );
      if (!session) {
        res.status(404).json({ success: false, message: 'Session not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          status: session.payment_status,
          customerEmail: session.customer_details?.email,
        },
      });
    } catch (error) {
      console.error('Payment success error:', error);
      next(error);
    }
  };
}
