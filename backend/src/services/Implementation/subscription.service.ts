import { injectable, inject } from 'tsyringe';
import ISubscription from '../../interfaces/ISubscription.types';
import { ISubscriptionService } from '../Interface/ISubscriptionService';
import { ISubscriptionRepository } from '../../repositories/Interface/ISubscriptionRepository';

@injectable()
export class SubscriptionService implements ISubscriptionService {
  constructor(
    @inject('SubscriptionRepository') private subscriptionRepository: ISubscriptionRepository
  ) {}

  async getSubscriptions(
    filters: any,
    page: number,
    pageSize: number
  ) {
    console.log("subscription service")
    const [subscriptions, total] = await Promise.all([
      this.subscriptionRepository.getSubscriptions(
        filters,
        page,
        pageSize
      ),
      this.subscriptionRepository.getTotalSubscriptionsCount(
        filters
      ),
    ]);

    return { subscriptions, total };
  }

  async createSubscription(
    subscriptionData: Partial<ISubscription>
  ) {
    return await this.subscriptionRepository.create(subscriptionData);
  }

  async updateSubscription(
    subscriptionId: string,
    subscriptionData: Partial<ISubscription>
  ) {
    return await this.subscriptionRepository.update(
      subscriptionId,
      subscriptionData
    );
  }


}
