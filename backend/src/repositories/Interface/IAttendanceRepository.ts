import { Connection } from 'mongoose';
import { IAttendance } from '../../interfaces/company/IAttendance.types';

export interface IAttendanceRepository {
  createAttendance(
    tenantConnection: Connection,
    attendanceData: Partial<IAttendance>
  ): Promise<IAttendance>;

  getAttendance(
    tenantConnection: Connection,
    query: any,
    page: number,
    limit: number
  ): Promise<{ attendance: IAttendance[]; total: number }>;

  updateAttendance(
    tenantConnection: Connection,
    attendanceId: string,
    updateData: Partial<IAttendance>
  ): Promise<IAttendance | null>;

  findTodayAttendance(
    tenantConnection: Connection,
    employeeId: string
  ): Promise<IAttendance | null>;
}
