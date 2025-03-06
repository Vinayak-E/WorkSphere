import { Connection } from 'mongoose';
import { injectable } from 'tsyringe';
import BaseRepository from '../baseRepository';
import { EmployeeSchema } from '../../models/employeeModel';
import { AttendanceSchema } from '../../models/attendanceModel';
import { IAttendance } from '../../interfaces/company/IAttendance.types';
import { IAttendanceRepository } from '../Interface/IAttendanceRepository';

@injectable()
export class AttendanceRepository extends BaseRepository<IAttendance> implements IAttendanceRepository{
  constructor() {
    super('Attendance', AttendanceSchema);
  }

  async createAttendance(
    tenantConnection: Connection,
    attendanceData: Partial<IAttendance>
  ): Promise<IAttendance> {
    return await this.create(tenantConnection, attendanceData);
  }

  async getAttendance(
    tenantConnection: Connection,
    query: any,
    page: number,
    limit: number
  ): Promise<{ attendance: IAttendance[]; total: number }> {
    const model = this.getModel(tenantConnection);
    if (!tenantConnection.models['Employee']) {
      tenantConnection.model('Employee', EmployeeSchema);
    }

    const attendance = await model
      .find(query)
      .populate('employeeId')
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    const total = await model.countDocuments(query).exec();
    return { attendance, total };
  }

  async updateAttendance(
    tenantConnection: Connection,
    attendanceId: string,
    updateData: Partial<IAttendance>
  ): Promise<IAttendance | null> {
    return await this.update(tenantConnection, attendanceId, updateData);
  }

  async findTodayAttendance(
    tenantConnection: Connection,
    employeeId: string
  ): Promise<IAttendance | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const model = this.getModel(tenantConnection);
    return await model.findOne({ employeeId, date: today }).exec();
  }
}
