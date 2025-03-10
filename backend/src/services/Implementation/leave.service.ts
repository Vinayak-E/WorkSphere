import { injectable, inject } from 'tsyringe';
import mongoose, { Connection } from 'mongoose';
import { ILeaveService } from '../Interface/ILeaveService';
import { ILeave } from '../../interfaces/company/IAttendance.types';
import { ILeaveRepository } from '../../repositories/Interface/ILeaveRepository';

@injectable()
export class LeaveService implements ILeaveService {
  constructor(
    @inject('LeaveRepository') private leaveRepository: ILeaveRepository
  ) {}

  async applyLeave(
    tenantConnection: Connection,
    employeeId: string,
    leaveData: Partial<ILeave>
  ): Promise<ILeave> {
    const { startDate, endDate, reason, leaveType } = leaveData;

    if (!startDate || !endDate || !reason || !leaveType) {
      throw new Error('All fields (startDate, endDate, reason, leaveType) are required');
    }

   
    const overlappingLeaves = await this.leaveRepository.findOverlappingLeaves(
      tenantConnection,
      employeeId,
      new Date(startDate),
      new Date(endDate)
    );

    if (overlappingLeaves.length > 0) {
      throw new Error('A leave request already exists for this period');
    }

    const leave = {
      employeeId: new mongoose.Types.ObjectId(employeeId),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: 'Pending' as 'Pending',
      leaveType: leaveType as 'Full Day' | 'Half Day',
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