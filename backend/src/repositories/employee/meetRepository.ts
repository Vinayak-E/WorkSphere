import mongoose, { Connection } from 'mongoose';
import { IMeetModel, IMeetRepository } from '../../interfaces/IMeet.types';
import { Model } from 'mongoose';
import Meet from '../../models/meetModel';
import Employee from '../../models/employeeModel';
import { IEmployee } from '../../interfaces/company/IEmployee.types';
import { ICompanyDocument } from '../../interfaces/company/company.types';
import Company from '../../models/companyModel';

export class MeetRepository implements IMeetRepository {
  private getMeetModel(connection: Connection): Model<IMeetModel> {
    return (
      connection.models.Meet ||
      connection.model<IMeetModel>('Meet', Meet.schema)
    );
  }
  private getEmployeeModel(connection: Connection): Model<IEmployee> {
    return (
      connection.models.Employee ||
      connection.model<IEmployee>('Employee', Employee.schema)
    );
  }
  private getCompanyModel(connection: Connection): Model<ICompanyDocument> {
    return (
      connection.models.Company ||
      connection.model<ICompanyDocument>('Company', Company.schema)
    );
  }

  async getMeetings(
    tenantConnection: mongoose.Connection,
    filters: any,
    page: number,
    pageSize: number
  ): Promise<IMeetModel[]> {
    const MeetModel = this.getMeetModel(tenantConnection);
    const EmployeeModel = this.getEmployeeModel(tenantConnection);
    const CompanyModel = this.getCompanyModel(tenantConnection);
    return await MeetModel.find(filters)
      .populate('members', 'name email')
      .populate('createdBy', 'email companyName name')
      .sort({ meetDate: 1, meetTime: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
  }

  async getTotalMeetingsCount(
    tenantConnection: mongoose.Connection,
    filters: any
  ): Promise<number> {
    const MeetModel = this.getMeetModel(tenantConnection);
    return await MeetModel.countDocuments(filters);
  }

  async createNewMeet(
    tenantConnection: mongoose.Connection,
    meetData: any
  ): Promise<IMeetModel> {
    const MeetModel = this.getMeetModel(tenantConnection);
    return await MeetModel.create(meetData);
  }
  async updateMeet(
    tenantConnection: mongoose.Connection,
    id: string,
    updateData: any
  ): Promise<IMeetModel | null> {
    const MeetModel = this.getMeetModel(tenantConnection);
    return await MeetModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteMeeting(tenantConnection: Connection, meetingId: string) {
    const MeetModel = this.getMeetModel(tenantConnection);
    return await MeetModel.findByIdAndDelete(meetingId);
  }
}
