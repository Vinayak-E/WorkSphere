import { injectable, inject } from 'tsyringe';

import { PaymentRepository } from '../../repositories/Implementation/payment.repository';
import { ISubscriptionService } from '../Interface/ISubscriptionService';
import { IPaymentHistory } from '../../models/paymentHistory';

@injectable()
export class PaymentService {
  constructor(
    @inject('PaymentRepository') private paymentRepository: PaymentRepository,
    @inject('SubscriptionService') private subscriptionService: ISubscriptionService
  ) {}

  async getCompanyPaymentHistory(companyId: string): Promise<IPaymentHistory[]> {
    return await this.paymentRepository.getPaymentsByCompanyId(companyId);
  }

  async getCompanyCurrentPlan(companyId: string, tenantId: string): Promise<any> {
 
    const payments = await this.paymentRepository.findAll(
      { companyId, status: 'succeeded' },
    );

    if (payments.length === 0) {
      return null;
    }

    const sortedPayments = payments.sort((a, b) => 
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );
    
    const latestPayment = sortedPayments[0];
    
    const { subscriptions } = await this.subscriptionService.getSubscriptions(
      { _id: latestPayment.planId },
      1,
      1
    );

    if (!subscriptions || subscriptions.length === 0) {
      return null;
    }

    return {
      payment: latestPayment,
      plan: subscriptions[0],
    };
  }

  async getRevenueStats(): Promise<any> {
    const totalRevenue = await this.paymentRepository.getTotalRevenue();

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const monthlyRevenue = [];
    for (let i = 0; i < 6; i++) {
      let month = currentMonth - i;
      let year = currentYear;
      if (month <= 0) {
        month += 12;
        year -= 1;
      }
      
      const revenue = await this.paymentRepository.getMonthlyRevenue(year, month);
      const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'short' });
      
      monthlyRevenue.unshift({ month: monthName, revenue });
    }
    
    const recentPayments = await this.paymentRepository.getRecentPayments(10);
    
    return {
      totalRevenue,
      monthlyRevenue,
      recentPayments,
    };
  }
}