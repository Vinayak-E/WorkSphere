import Department from "../../models/departmentModel";
import { IDepartment } from "../../interfaces/company/IDepartment.types";
import { ICreateEmployee, IEmployee, IUpdateEmployee } from "../../interfaces/company/IEmployee.types";
import { Connection } from "mongoose";
import { Model } from "mongoose";
import Employee from "../../models/employeeModel";
import Attendance from "../../models/attendanceModel";
import Leave from "../../models/leavesModel";
import { IAttendance, ILeave } from "../../interfaces/company/IAttendance.types";

export class EmployeeRepository {
    private getEmployeeModel(connection: Connection): Model<IEmployee> {
        return connection.models.Employee || connection.model<IEmployee>("Employee", Employee.schema);
    }


    private getDepartmentModel(connection: Connection): Model<IDepartment> {
        return connection.models.Department || connection.model<IDepartment>("Department", Department.schema);
    }
    private getAttendanceModel(connection: Connection) {
        return connection.models.Attendance || connection.model<IAttendance>("Attendance", Attendance.schema);
    }

    private getLeaveModel(connection: Connection) {
        return connection.models.Leave || connection.model<ILeave>("Leave", Leave.schema);
    }


    async getEmployees(connection: Connection): Promise<IEmployee[]> {
        try {
        
            const EmployeeModel = this.getEmployeeModel(connection);
            const DepartmentModel = this.getDepartmentModel(connection);

            return await EmployeeModel.find()
                .populate('department')
                .exec();
        } catch (error) {
            throw error;
        }
    }

   
    async createEmployee(employeeData: ICreateEmployee, connection: Connection): Promise<IEmployee> {
        try {
            const EmployeeModel = this.getEmployeeModel(connection);
            const employee = new EmployeeModel(employeeData);
            return await employee.save();
        } catch (error) {
            throw error;
        }
    }


    
    async update(id: string, updateData: IUpdateEmployee, connection: Connection): Promise<IEmployee | null> {
        const EmployeeModel = this.getEmployeeModel(connection);
        return await EmployeeModel.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true, runValidators: true }
        );
      }

      async getEmployeeByEmail(connection: Connection, email: string): Promise<IEmployee | null> {
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

    async findAttendance(connection: Connection, query: {
        employeeId: string;
        date: Date;
    }): Promise<IAttendance | null> {
        const AttendanceModel = this.getAttendanceModel(connection);
        const startOfDay = new Date(query.date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(query.date);
        endOfDay.setHours(23, 59, 59, 999);

        return await AttendanceModel.findOne({
            employeeId: query.employeeId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });
    }

    async checkActiveLeave(connection: Connection, query: {
        employeeId: string;
        date: Date;
    }): Promise<boolean> {
        const LeaveModel = this.getLeaveModel(connection);
        const date = query.date;

        const leave = await LeaveModel.findOne({
            employeeId: query.employeeId,
            startDate: { $lte: date },
            endDate: { $gte: date },
            status: "Approved"
        });

        return !!leave;
    }

    async createAttendance(connection: Connection, attendanceData: Partial<IAttendance>): Promise<IAttendance> {
        const AttendanceModel = this.getAttendanceModel(connection);
        const attendance = new AttendanceModel(attendanceData);
        return await attendance.save();
    }


}
