import { injectable, inject } from 'tsyringe';
import { Messages } from '../../constants/messages';
import { HttpStatus } from '../../constants/httpStatus';
import { Request, Response, NextFunction } from 'express';
import { ISubscriptionController } from '../Interface/ISubscriptionController';
import { ISubscriptionService } from '../../services/Interface/ISubscriptionService';

@injectable()
export class SubscriptionController implements ISubscriptionController {
  constructor(
    @inject('SubscriptionService')
    private subscriptionService: ISubscriptionService
  ) {}

  getSubscriptions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const searchQuery = req.query.searchQuery as string;
      const planType = req.query.planType as string;

      const filters: any = {};

      if (searchQuery) {
        filters.$or = [
          { planName: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
        ];
      }

      if (planType && planType !== 'all') {
        filters.planType = planType;
      }
      const { subscriptions, total } =
        await this.subscriptionService.getSubscriptions(
          filters,
          page,
          pageSize
        );

      res.status(HttpStatus.OK).json({
        success: true,
        data: subscriptions,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      });
    } catch (error) {
      next(error);
    }
  };

  createSubscription = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: Messages.UNAUTHORIZED_ACCESS,
        });
        return;
      }

      const subscriptionData = {
        ...req.body,
        isActive: req.body.isActive === undefined ? true : req.body.isActive,
      };
      const subscription =
        await this.subscriptionService.createSubscription(subscriptionData);

      res.status(HttpStatus.CREATED).json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  };

  updateSubscription = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: Messages.UNAUTHORIZED_ACCESS,
        });
        return;
      }

      const subscription = await this.subscriptionService.updateSubscription(
        req.params.id,
        req.body
      );

      if (!subscription) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: Messages.SUBSCRIPTION_NOT_FOUND,
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  };
}
