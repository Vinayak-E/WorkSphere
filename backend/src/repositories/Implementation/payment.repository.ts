import { injectable, inject } from 'tsyringe';
import { Connection } from 'mongoose';
import BaseRepository from '../baseRepository';
import { IPaymentHistory } from '../../interfaces/IPayment.types';
import { PaymentHistorySchema } from '../../models/paymentHistory';
import { IPaymentRepository } from '../Interface/IPaymentRepository';

@injectable()
export class PaymentRepository extends BaseRepository<IPaymentHistory> implements IPaymentRepository {
  constructor(@inject('MainConnection') mainConnection: Connection) {
    super('PaymentHistory', PaymentHistorySchema, mainConnection);
  }

  async getPaymentsByCompanyId(companyId: string, page: number = 1, limit: number = 10): Promise<{ payments: IPaymentHistory[], total: number }> {
    const skip = (page - 1) * limit;
    let query = { tenantId : companyId};
    let total = await this.getModel().countDocuments(query);
       
    const payments = await this.getModel()
      .find(query)
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return { payments, total };
}

  async getPaymentsByTenantId(tenantId: string): Promise<IPaymentHistory[]> {
    return await this.findAll({ tenantId });
  }

  async getRecentPayments(page: number = 1, limit: number = 10): Promise<{ payments: IPaymentHistory[], total: number }> {
    const skip = (page - 1) * limit;
    const model = this.getModel();
  
    const total = await model.countDocuments();
    const payments = await model
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  
    return { payments, total };
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