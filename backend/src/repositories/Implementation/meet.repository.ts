import { Connection } from 'mongoose';
import { injectable } from 'tsyringe';
import BaseRepository from '../baseRepository';
import { MeetSchema } from '../../models/meetModel';
import { CompanySchema } from '../../models/companyModel';
import { EmployeeSchema } from '../../models/employeeModel';
import { IMeetModel } from '../../interfaces/IMeet.types';
import { IMeetRepository } from '../Interface/IMeetRepository';

@injectable()
export class MeetRepository
  extends BaseRepository<IMeetModel>
  implements IMeetRepository
{
  constructor() {
    super('Meet', MeetSchema);
  }

  async getMeetings(
    tenantConnection: Connection,
    filters: any,
    page: number, 
    pageSize: number
  ): Promise<IMeetModel[]> {
    const model = this.getModel(tenantConnection);
    if (!tenantConnection.models['Employee']) {
      tenantConnection.model('Employee', EmployeeSchema);
    }
    if (!tenantConnection.models['Company']) {
      tenantConnection.model('Company', CompanySchema);
    }
    return await model
      .find(filters)
      .populate('members', 'name email')
      .populate('createdBy', 'email companyName name')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();
  }

  async getTotalMeetingsCount(
    tenantConnection: Connection,
    filters: any
  ): Promise<number> {
    const model = this.getModel(tenantConnection);
    return await model.countDocuments(filters).exec();
  }
}
