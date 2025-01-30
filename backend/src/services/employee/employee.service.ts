import mongoose, { Connection } from "mongoose";
import { IEmployee, IUpdateEmployee } from "../../interfaces/company/IEmployee.types";
import { EmployeeRepository } from "../../repositories/company/employeeRepository";
import { IUserRepository } from "../../interfaces/IUser.types";
import { IAttendance } from "../../interfaces/company/IAttendance.types";



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

          // Check if already checked in
          const existingAttendance = await this.employeeRepository.findAttendance(connection, {
              employeeId,
              date: today
          });

          if (existingAttendance) {
              throw new Error("Already checked in today");
          }

          // Check if on approved leave
          const isOnLeave = await this.employeeRepository.checkActiveLeave(connection, {
              employeeId,
              date: today
          });

          if (isOnLeave) {
              throw new Error("You are on approved leave today");
          }

          // Create new attendance record
          const attendance = await this.employeeRepository.createAttendance(connection, {
              employeeId: new mongoose.Types.ObjectId(employeeId),
              date: today,
              checkInTime: new Date(),
              status: "Present"
          });

          return attendance;
      } catch (error) {
          console.error("Error in EmployeeService.checkIn:", error);
          throw error;
      }
  }

  }