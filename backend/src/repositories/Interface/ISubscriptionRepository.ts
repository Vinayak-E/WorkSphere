import ISubscription from '../../interfaces/ISubscription.types';

export interface ISubscriptionRepository {
  getSubscriptions(
    filters: any,
    page: number,
    pageSize: number
  ): Promise<ISubscription[]>;
  
  getTotalSubscriptionsCount(filters: any): Promise<number>;
  
  create(data: Partial<ISubscription>): Promise<ISubscription>;
  
  update(
    id: string,
    data: Partial<ISubscription>
  ): Promise<ISubscription | null>;
  
  delete(id: string): Promise<ISubscription | null>;
  findOne(query: Record<string, any>): Promise<ISubscription | null>
  findById(id: string): Promise<ISubscription | null>
}