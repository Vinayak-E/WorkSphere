import { injectable, inject } from 'tsyringe';
import mongoose, { Connection } from 'mongoose';
import { IAttendance } from '../../interfaces/company/IAttendance.types';
import { AttendanceRepository } from '../../repositories/Implementation/attendance.repository';
import { IAttendanceService } from '../Interface/IAttendanceService';

@injectable()
export class AttendanceService implements IAttendanceService{
    constructor(
        @inject('AttendanceRepository') private attendanceRepository: AttendanceRepository
      ) {}

      async checkIn(tenantConnection: Connection, employeeId: string): Promise<IAttendance> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existingAttendance = await this.attendanceRepository.findTodayAttendance(
          tenantConnection,
          employeeId
        );
        if (existingAttendance) {
          throw new Error('Already checked in today');
        }
        const attendanceData = {
          employeeId: new mongoose.Types.ObjectId(employeeId),
          date: today,
          checkInTime: new Date(),
          status: "Marked" as "Marked",
          checkInStatus: true,
        };
        return await this.attendanceRepository.createAttendance(tenantConnection, attendanceData);
      }
    
      async checkOut(tenantConnection: Connection, employeeId: string): Promise<IAttendance |null> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existingAttendance = await this.attendanceRepository.findTodayAttendance(
          tenantConnection,
          employeeId
        );
        if (!existingAttendance) {
          throw new Error('No check-in record found for today');
        }
        if (existingAttendance.checkOutTime) {
          throw new Error('Already checked out today');
        }
        if (!existingAttendance.checkInTime) {
          throw new Error('Check-in time is not set');
        }
        const now = new Date();
        const totalHours = this.calculateTotalHours(existingAttendance.checkInTime, now);
        let status: 'Absent' | 'Present' | 'Half Day' = 'Absent';
        if (totalHours >= 7) status = 'Present';
        else if (totalHours >= 2) status = 'Half Day';
        const updateData = {
          checkInStatus: false,
          checkOutTime: now,
          totalWorkedTime: totalHours,
          status,
        };
        return await this.attendanceRepository.updateAttendance(
          tenantConnection,
          existingAttendance._id,
          updateData
        );
      }
    
      private calculateTotalHours(checkInTime: Date, checkOutTime: Date): number {
        const diffMs = checkOutTime.getTime() - checkInTime.getTime();
        return Number((diffMs / (1000 * 60 * 60)).toFixed(2));
      }
    
      async getTodayAttendance(
        tenantConnection: Connection,
        employeeId: string
      ): Promise<IAttendance | null> {
        return await this.attendanceRepository.findTodayAttendance(tenantConnection, employeeId);
      }
    
      async getEmployeeAttendanceHistory(
        tenantConnection: Connection,
        employeeId: string,
        page: number,
        limit: number,
        filters?: any
      ): Promise<{ attendance: IAttendance[], total: number }> {
        const query = { employeeId, ...filters };
        return await this.attendanceRepository.getAttendance(tenantConnection, query, page, limit);
      }
    
      async getAllAttendance(
        tenantConnection: Connection,
        page: number,
        limit: number,
        filters?: any
      ): Promise<{ attendance: IAttendance[], total: number }> {
        const query = { ...filters };
        if (filters?.date) {
          const startDate = new Date(filters.date);
          startDate.setHours(0, 0, 0, 0);
      
          const endDate = new Date(filters.date);
          endDate.setHours(23, 59, 59, 999);
      
          query.date = {
            $gte: startDate,
            $lte: endDate,
          };
        }
        console.log('query', query);
        return await this.attendanceRepository.getAttendance(tenantConnection, query, page, limit);
      }
    }