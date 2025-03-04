import { injectable, inject } from 'tsyringe';
import mongoose, { Connection } from 'mongoose';
import { ILeave } from '../../interfaces/company/IAttendance.types';
import { LeaveRepository } from '../../repositories/Implementation/leave.repository';
import { ILeaveService } from '../Interface/ILeaveService';

@injectable()
export class LeaveService implements ILeaveService {
  constructor(
    @inject('LeaveRepository') private leaveRepository: LeaveRepository
  ) {}

  async applyLeave(
    tenantConnection: Connection,
    employeeId: string,
    leaveData: Partial<ILeave>
  ): Promise<ILeave> {
    const leave = {
      ...leaveData,
      employeeId: new mongoose.Types.ObjectId(employeeId),
      status: 'Pending' as 'Pending',
    };
    return await this.leaveRepository.createLeave(tenantConnection, leave);
  }

  async getEmployeeLeaves(
    tenantConnection: Connection,
    employeeId: string,
    page: number,
    limit: number,
    filters?: any
  ): Promise<{ leaves: ILeave[], total: number }> {
    const query = { employeeId, ...filters };
    return await this.leaveRepository.getLeaves(tenantConnection, query, page, limit);
  }

  async getAllLeaves(
    tenantConnection: Connection,
    page: number,
    limit: number,
    filters?: any
  ): Promise<{ leaves: ILeave[], total: number }> {
    const query = { ...filters };
    return await this.leaveRepository.getLeaves(tenantConnection, query, page, limit);
  }

  async updateLeaveStatus(
    tenantConnection: Connection,
    leaveId: string,
     status: "Pending" | "Approved" | "Rejected"
  ): Promise<ILeave | null> {
    return await this.leaveRepository.updateLeave(tenantConnection, leaveId, { status });
  }
} 