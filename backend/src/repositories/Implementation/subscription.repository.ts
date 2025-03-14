import { inject, injectable } from 'tsyringe';
import { Connection } from 'mongoose';
import BaseRepository from '../baseRepository';

import ISubscription from '../../interfaces/ISubscription.types';
import { ISubscriptionRepository } from '../Interface/ISubscriptionRepository';
import { subscriptionPlanSchema } from '../../models/subscriptionModel';

@injectable()
export class SubscriptionRepository
  extends BaseRepository<ISubscription>
  implements ISubscriptionRepository
{
  constructor(@inject('MainConnection') mainConnection: Connection) {
    super('Subscription', subscriptionPlanSchema, mainConnection);
  }

  async getSubscriptions(
    filters: any,
    page: number, 
    pageSize: number
  ): Promise<ISubscription[]> {
    const model = this.getModel();
    return await model
      .find(filters)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .exec();
  }

  async getTotalSubscriptionsCount(
    filters: any
  ): Promise<number> {
    const model = this.getModel();
    return await model.countDocuments(filters).exec();
  }

}
