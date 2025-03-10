import { Connection } from 'mongoose';
import { ILeave } from '../../interfaces/company/IAttendance.types';

export interface ILeaveService {
  applyLeave(
    tenantConnection: Connection,
    employeeId: string,
    leaveData: Partial<ILeave>
  ): Promise<ILeave>;

  getEmployeeLeaves(
    tenantConnection: Connection,
    employeeId: string,
    page: number,
    limit: number,
    filters?: any
  ): Promise<{ leaves: ILeave[]; total: number }>;

  getAllLeaves(
    tenantConnection: Connection,
    page: number,
    limit: number,
    filters?: any
  ): Promise<{ leaves: ILeave[]; total: number }>;

  updateLeaveStatus(
    tenantConnection: Connection,
    leaveId: string,
    status: "Pending" | "Approved" | "Rejected"
  ): Promise<ILeave | null>;
}
