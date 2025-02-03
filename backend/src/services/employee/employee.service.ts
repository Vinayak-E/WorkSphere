import mongoose, { Connection } from "mongoose";
import { IEmployee, IUpdateEmployee } from "../../interfaces/company/IEmployee.types";
import { EmployeeRepository } from "../../repositories/employee/employeeRepository";
import { IUserRepository } from "../../interfaces/IUser.types";
import { IAttendance, ILeave } from "../../interfaces/company/IAttendance.types";



export class EmployeeService {
    constructor(private readonly employeeRepository:EmployeeRepository,
      private readonly userRepository:IUserRepository) {}
  
   
      async getEmployeeProfile(connection: Connection, email: string): Promise<IEmployee> {
        try {
            const employee = await this.employeeRepository.getEmployeeByEmail(connection, email);
            if (!employee) {
                throw new Error('Employee not found');
            }
    
            return employee;
        } catch (error) {
            console.error("Error in CompanyService.getEmployeeProfile:", error);
            throw error;
        }
    }
    
  
    async updateProfile( id:string, connection: Connection, updateData: IUpdateEmployee ): Promise<IEmployee> {
      try{

        const updatedEmployee = await this.employeeRepository.update(id, updateData, connection);
        if (!updatedEmployee) {
          throw new Error('Employee not found');
        }
    
        return updatedEmployee;
      } catch (error) {
        console.error("Error in CompanyService.getEmployeeProfile:", error);
        throw error;
    }
    }
   
    async checkIn(connection: Connection, employeeId: string): Promise<IAttendance> {
      try {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

        
          const existingAttendance = await this.employeeRepository.findAttendance(connection, {
              employeeId,
              date: today
          });

          if (existingAttendance) {
              throw new Error("Already checked in today");
          }

          const isOnLeave = await this.employeeRepository.checkActiveLeave(connection, {
              employeeId,
              date: today
          });

          if (isOnLeave) {
              throw new Error("You are on approved leave today");
          }

          const attendance = await this.employeeRepository.createAttendance(connection, {
              employeeId: new mongoose.Types.ObjectId(employeeId),
              date: today,
              checkInTime: new Date(),
              status: "Marked",
              checkInStatus:true
          });

          return attendance;
      } catch (error) {
          console.error("Error in EmployeeService.checkIn:", error);
          throw error;
      }
  }

  async checkOut(connection: Connection, employeeId: string): Promise<IAttendance> {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingAttendance = await this.employeeRepository.findAttendance(connection, {
            employeeId,
            date: today
        });

        if (!existingAttendance) {
            throw new Error("No check-in record found for today");
        }

        if (existingAttendance.checkOutTime) {
            throw new Error("Already checked out today");
        }

        if (!existingAttendance.checkInTime) {
            throw new Error("Invalid attendance record: no check-in time found");
        }

        const now = new Date();
        const totalHours = this.calculateTotalHours(existingAttendance.checkInTime, now);

        let status: "Absent" | "Present" | "Half Day"  = "Absent";
        if (totalHours >= 7) {
            status = "Present";
        } else if (totalHours >= 2) {
            status = "Half Day";
        }

        const attendance = await this.employeeRepository.updateAttendance(
            connection,
            existingAttendance._id,
            {
                checkInStatus: false,
                checkOutTime: now,
                totalWorkedTime: totalHours,
                status: status
            }
        );

        return attendance;
    } catch (error) {
        throw error;
    }
}

private calculateTotalHours(checkInTime: Date, checkOutTime: Date): number {
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    return Number((diffMs / (1000 * 60 * 60)).toFixed(2));
}

async getAttendanceStatus(connection: Connection, employeeId: string): Promise<IAttendance | null> {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await this.employeeRepository.findAttendance(connection, {
            employeeId,
            date: today
        });
        return attendance;
    } catch (error) {
        throw error;
    }
}

async getLeaves(
    connection: Connection,
    email: string,
    page: number,
    limit: number,
    startDate?: string,
    endDate?: string
  ): Promise<{ leaves: ILeave[]; total: number }> {
    try {
        const employee = await this.employeeRepository.getEmployeeByEmail(connection, email);
        if (!employee) throw new Error("Employee not found");

        const employeeId =  employee._id;

      return await this.employeeRepository.getLeaves(
        connection,
        employeeId,
        page,
        limit,
        startDate,
        endDate
      );
    } catch (error) {
      throw error;
    }
  }
  async applyLeave(
    connection: Connection,
    email: string,
    startDate: string,
    endDate: string,
    reason: string
): Promise<ILeave> {
    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start > end) throw new Error("Start date cannot be after end date");

        const employee = await this.employeeRepository.getEmployeeByEmail(connection, email);
        if (!employee) throw new Error("Employee not found");

        const employeeId =  typeof employee._id === "string" ? new mongoose.Types.ObjectId(employee._id) : employee._id;

        const leaveData: Partial<ILeave> = {
            employeeId,
            startDate: start,
            endDate: end,
            reason,
            status: "Pending",
        };

        return await this.employeeRepository.createLeave(connection, leaveData);
    } catch (error) {
        throw error;
    }
}



  }