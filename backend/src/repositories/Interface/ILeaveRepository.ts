import { Connection } from 'mongoose';
import { ILeave } from '../../interfaces/company/IAttendance.types';
export interface ILeaveRepository {
  createLeave(
    tenantConnection: Connection,
    leaveData: Partial<ILeave>
  ): Promise<ILeave>;

  getLeaves(
    tenantConnection: Connection,
    query: any,
    page: number,
    limit: number
  ): Promise<{ leaves: ILeave[]; total: number }>;

  updateLeave(
    tenantConnection: Connection,
    leaveId: string,
    updateData: Partial<ILeave>
  ): Promise<ILeave | null>;

  findOverlappingLeaves(
    tenantConnection: Connection,
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ILeave[]>;
}
