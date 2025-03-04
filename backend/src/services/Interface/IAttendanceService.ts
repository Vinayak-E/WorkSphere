import { Connection } from 'mongoose';
import { IAttendance } from '../../interfaces/company/IAttendance.types';

export interface IAttendanceService {
  checkIn(
    tenantConnection: Connection,
    employeeId: string
  ): Promise<IAttendance>;

  checkOut(
    tenantConnection: Connection,
    employeeId: string
  ): Promise<IAttendance | null>;

  getTodayAttendance(
    tenantConnection: Connection,
    employeeId: string
  ): Promise<IAttendance | null>;

  getEmployeeAttendanceHistory(
    tenantConnection: Connection,
    employeeId: string,
    page: number,
    limit: number,
    filters?: any
  ): Promise<{ attendance: IAttendance[]; total: number }>;

  getAllAttendance(
    tenantConnection: Connection,
    page: number,
    limit: number,
    filters?: any
  ): Promise<{ attendance: IAttendance[]; total: number }>;
}
