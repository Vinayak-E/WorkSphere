import { Connection } from 'mongoose';
import { inject, injectable } from 'tsyringe';
import BaseRepository from '../baseRepository';
import { LeaveSchema } from '../../models/leavesModel';
import { EmployeeSchema } from '../../models/employeeModel';
import { ILeaveRepository } from '../Interface/ILeaveRepository';
import { ILeave } from '../../interfaces/company/IAttendance.types';

@injectable()
export class LeaveRepository extends BaseRepository<ILeave> implements ILeaveRepository {
  constructor(@inject('MainConnection') mainConnection: Connection) {
    super('Leave', LeaveSchema ,mainConnection);
  }

  async createLeave(tenantConnection: Connection, leaveData: Partial<ILeave>): Promise<ILeave> {
    return await this.create(leaveData,tenantConnection);
  }

  async getLeaves(
    tenantConnection: Connection,
    query: any,
    page: number,
    limit: number
  ): Promise<{ leaves: ILeave[], total: number }> {
    const model = this.getModel(tenantConnection);
    if (!tenantConnection.models['Employee']) {
      tenantConnection.model('Employee', EmployeeSchema);
    }
    const leaves = await model
      .find(query)
      .populate('employeeId')
      .sort([['appliedAt', -1]])
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    const total = await model.countDocuments(query).exec();
    return { leaves, total };
  }

  async updateLeave(
    tenantConnection: Connection,
    leaveId: string,
    updateData: Partial<ILeave>
  ): Promise<ILeave | null> {
    return await this.update(leaveId, updateData,tenantConnection);
  }

  async findOverlappingLeaves(
    tenantConnection: Connection,
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ILeave[]> {
    const model = this.getModel(tenantConnection);
    return await model.find({
      employeeId,
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
        { startDate: { $gte: startDate, $lte: endDate } },
        { endDate: { $gte: startDate, $lte: endDate } },
      ],
    }).exec();
  }
}