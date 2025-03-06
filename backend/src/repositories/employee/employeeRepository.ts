import Department from '../../models/departmentModel';
import { IDepartment } from '../../interfaces/company/IDepartment.types';
import {
  ICreateEmployee,
  IEmployee,
  IUpdateEmployee,
} from '../../interfaces/company/IEmployee.types';
import mongoose, { Connection, Types } from 'mongoose';
import { Model } from 'mongoose';
import Employee from '../../models/employeeModel';
import {AttendanceSchema} from '../../models/attendanceModel';
import Leave from '../../models/leavesModel';
import {
  IAttendance,
  ILeave,
} from '../../interfaces/company/IAttendance.types';
import { injectable } from 'tsyringe';
@injectable()
export class EmployeeRepository {
  private getEmployeeModel(connection: Connection): Model<IEmployee> {
    return (
      connection.models.Employee ||
      connection.model<IEmployee>('Employee', Employee.schema)
    );
  }

  private getDepartmentModel(connection: Connection): Model<IDepartment> {
    return (
      connection.models.Department ||
      connection.model<IDepartment>('Department', Department.schema)
    );
  }
  private getAttendanceModel(connection: Connection) {
    return (
      connection.models.Attendance ||
      connection.model<IAttendance>('Attendance', AttendanceSchema)
    );
  }

  private getLeaveModel(connection: Connection) {
    return (
      connection.models.Leave || connection.model<ILeave>('Leave', Leave.schema)
    );
  }

  async getEmployees(connection: Connection): Promise<IEmployee[]> {
    try {
      const EmployeeModel = this.getEmployeeModel(connection);
      const DepartmentModel = this.getDepartmentModel(connection);

      return await EmployeeModel.find().populate('department').exec();
    } catch (error) {
      throw error;
    }
  }

  async createEmployee(
    employeeData: ICreateEmployee,
    connection: Connection
  ): Promise<IEmployee> {
    try {
      const EmployeeModel = this.getEmployeeModel(connection);
      const employee = new EmployeeModel(employeeData);
      return await employee.save();
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: string,
    updateData: IUpdateEmployee,
    connection: Connection
  ): Promise<IEmployee | null> {
    const EmployeeModel = this.getEmployeeModel(connection);
    return await EmployeeModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }
  async getEmployeeById(
    connection: Connection,
    id: string | Types.ObjectId
  ): Promise<IEmployee | null> {
    try {
      const EmployeeModel = this.getEmployeeModel(connection);
      const DepartmentModel = this.getDepartmentModel(connection);
      return await EmployeeModel.findById(id).populate('department').exec();
    } catch (error) {
      throw error;
    }
  }

  async getEmployeeByEmail(
    connection: Connection,
    email: string
  ): Promise<IEmployee | null> {
    try {
      const EmployeeModel = this.getEmployeeModel(connection);
      const DepartmentModel = this.getDepartmentModel(connection);
      return await EmployeeModel.findOne({ email })
        .populate('department')
        .exec();
    } catch (error) {
      throw error;
    }
  }

  async findAttendance(
    connection: Connection,
    query: {
      employeeId: string;
      date: Date;
    }
  ): Promise<IAttendance | null> {
    const AttendanceModel = this.getAttendanceModel(connection);
    const startOfDay = new Date(query.date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(query.date);
    endOfDay.setHours(23, 59, 59, 999);

    return await AttendanceModel.findOne({
      employeeId: query.employeeId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });
  }

  async checkActiveLeave(
    connection: Connection,
    query: { employeeId: string; date: Date }
  ): Promise<boolean> {
    const LeaveModel = this.getLeaveModel(connection);
    const date = new Date(query.date);
    date.setHours(0, 0, 0, 0);

    const leave = await LeaveModel.findOne({
      employeeId: query.employeeId,
      startDate: { $lte: date },
      endDate: { $gte: date },
      status: 'Approved',
    }).lean();
    console.log('leave', leave);
    return !!leave;
  }

  async createAttendance(
    connection: Connection,
    attendanceData: Partial<IAttendance>
  ): Promise<IAttendance> {
    const AttendanceModel = this.getAttendanceModel(connection);
    const attendance = new AttendanceModel(attendanceData);
    return await attendance.save();
  }

  async updateAttendance(
    connection: Connection,
    attendanceId: string,
    updateData: Partial<IAttendance>
  ): Promise<IAttendance> {
    const AttendanceModel = this.getAttendanceModel(connection);
    const attendance = await AttendanceModel.findByIdAndUpdate(
      attendanceId,
      { $set: updateData },
      { new: true }
    );

    if (!attendance) {
      throw new Error('Attendance record not found');
    }

    return attendance;
  }

  async getLeaves(
    connection: Connection,
    employeeId: string,
    page: number,
    limit: number,
    startDate?: string,
    endDate?: string
  ): Promise<{ leaves: ILeave[]; total: number }> {
    try {
      const LeaveModel = this.getLeaveModel(connection);

      const query: any = {
        employeeId: new mongoose.Types.ObjectId(employeeId),
      };

      if (startDate && endDate) {
        query.startDate = { $gte: new Date(startDate) };
        query.endDate = { $lte: new Date(endDate) };
      } else if (startDate) {
        query.startDate = { $gte: new Date(startDate) };
      } else if (endDate) {
        query.endDate = { $lte: new Date(endDate) };
      }

      const [leaves, total] = await Promise.all([
        LeaveModel.find(query)
          .sort([['appliedAt', -1]])
          .skip((page - 1) * limit)
          .limit(limit)
          .exec(),
        LeaveModel.countDocuments(query),
      ]);

      return { leaves, total };
    } catch (error) {
      throw error;
    }
  }
  async createLeave(
    connection: Connection,
    leaveData: Partial<ILeave>
  ): Promise<ILeave> {
    try {
      const LeaveModel = this.getLeaveModel(connection);
      const leave = new LeaveModel(leaveData);
      return await leave.save();
    } catch (error) {
      throw error;
    }
  }
  async getEmployeesByDepartment(
    connection: Connection,
    departmentId: string | Types.ObjectId
  ): Promise<IEmployee[]> {
    try {
      const EmployeeModel = this.getEmployeeModel(connection);
      const DepartmentModel = this.getDepartmentModel(connection);
      return await EmployeeModel.find({
        department: departmentId,
      })
        .populate('department')
        .select('name email role department')
        .exec();
    } catch (error) {
      throw error;
    }
  }
}
