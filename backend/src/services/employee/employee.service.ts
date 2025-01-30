import { Connection } from "mongoose";
import { IEmployee, IUpdateEmployee } from "../../interfaces/company/IEmployee.types";
import { EmployeeRepository } from "../../repositories/company/employeeRepository";
import { IUserRepository } from "../../interfaces/IUser.types";



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
    
  
    async updateProfile(
        id:string,
        connection: Connection,
      updateData: IUpdateEmployee,
    ): Promise<IEmployee> {
    
  
      const updatedEmployee = await this.employeeRepository.update(id, updateData, connection);
      if (!updatedEmployee) {
        throw new Error('Employee not found');
      }
  
      return updatedEmployee;
    }
  
  
  
    
  
  
  }