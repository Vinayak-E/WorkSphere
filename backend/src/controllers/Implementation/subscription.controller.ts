import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { ISubscriptionController } from '../Interface/ISubscriptionController';
import { ISubscriptionService } from '../../services/Interface/ISubscriptionService';

@injectable()
export class SubscriptionController implements ISubscriptionController {
  constructor(
    @inject('SubscriptionService') private subscriptionService: ISubscriptionService
  ) {}

  getSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const searchQuery = req.query.searchQuery as string;
      const planType = req.query.planType as string;

      const filters: any = {};

      if (searchQuery) {
        filters.$or = [
          { planName: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } }
        ];
      }

      if (planType && planType !== 'all') {
        filters.planType = planType;
      }
      const { subscriptions, total } = await this.subscriptionService.getSubscriptions(
        filters,
        page,
        pageSize
      );

      res.status(200).json({
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

  createSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {

      if ( !req.user || req.user.role !== 'ADMIN') {
        res.status(401).json({
          success: false,
          message: 'Unauthorized access to subscription management',
        });
        return;
      }

      const subscriptionData = {
        ...req.body,
        isActive: req.body.isActive === undefined ? true : req.body.isActive
      };
      console.log("subscription data",subscriptionData)
      const subscription = await this.subscriptionService.createSubscription(
        subscriptionData
      );
      
      res.status(201).json({
        success: true,
        data: subscription
      });
    } catch (error) {
      next(error);
    }
  };

  updateSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try { 
      if ( !req.user || req.user.role !== 'ADMIN') {
        res.status(401).json({
          success: false,
          message: 'Unauthorized access to subscription management',
        });
        return;
      }
console.log("at update",req.body)
      const subscription = await this.subscriptionService.updateSubscription(
        req.params.id,
        req.body
      );
      
      if (!subscription) {
          res.status(404).json({ 
          success: false,
          message: 'Subscription plan not found' 
        });
        return 
      }
      
      res.status(200).json({
        success: true,
        data: subscription
      });
    } catch (error) {
      next(error);
    }
  };

  
}