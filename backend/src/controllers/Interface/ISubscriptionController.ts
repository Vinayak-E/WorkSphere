import { Request, Response, NextFunction } from 'express';

export interface ISubscriptionController {
  getSubscriptions(req: Request, res: Response, next: NextFunction): Promise<void>;
  createSubscription(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateSubscription(req: Request, res: Response, next: NextFunction): Promise<void>;
 
}