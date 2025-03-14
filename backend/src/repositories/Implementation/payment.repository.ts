import { injectable, inject } from 'tsyringe';
import { Connection } from 'mongoose';

import BaseRepository from '../baseRepository';
import PaymentHistory, { IPaymentHistory } from '../../models/paymentHistory';

@injectable()
export class PaymentRepository extends BaseRepository<IPaymentHistory> {
  constructor(@inject('MainConnection') mainConnection: Connection) {
    super('PaymentHistory', PaymentHistory.schema, mainConnection);
  }

  async getPaymentsByCompanyId(companyId: string): Promise<IPaymentHistory[]> {
    let payments = await this.findAll({ tenantId: companyId });

    if (payments.length === 0) {
      payments = await this.findAll({ companyId });
    }
    return payments;
  }

  async getPaymentsByTenantId(tenantId: string): Promise<IPaymentHistory[]> {
    return await this.findAll({ tenantId });
  }

  async getRecentPayments(limit: number = 10, ): Promise<IPaymentHistory[]> {
    const model = this.getModel();
    return await model.find().sort({ createdAt: -1 }).limit(limit).exec();
  }

  async getTotalRevenue(): Promise<number> {
    const model = this.getModel();
    const result = await model.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return result.length > 0 ? result[0].total : 0;
  }

  async getMonthlyRevenue(year: number, month: number): Promise<number> {
    const model = this.getModel();
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const result = await model.aggregate([
      { 
        $match: { 
          status: 'succeeded',
          paymentDate: { $gte: startDate, $lte: endDate } 
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return result.length > 0 ? result[0].total : 0;
  }
}