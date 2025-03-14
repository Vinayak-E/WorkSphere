import ISubscription from "../../interfaces/ISubscription.types";

export interface ISubscriptionService {
  getSubscriptions(
    filters: any,
    page: number,
    pageSize: number
  ): Promise<{ subscriptions: ISubscription[]; total: number }>;
  
  createSubscription(subscriptionData: Partial<ISubscription>): Promise<ISubscription>;
  
  updateSubscription(
    subscriptionId: string,
    subscriptionData: Partial<ISubscription>
  ): Promise<ISubscription | null>;
  
}