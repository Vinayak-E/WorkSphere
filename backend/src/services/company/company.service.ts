import { IEmployee,ICreateEmployee, IUpdateEmployee } from "../../interfaces/company/IEmployee.types";
import { sendEmail } from "../../utils/email";
import bcrypt from 'bcryptjs'
import { Connection } from "mongoose";
import { EmployeeRepository } from "../../repositories/employee/employeeRepository";
import { IUserRepository } from "../../interfaces/IUser.types";
import { envConfig } from "../../configs/envConfig";
import { generateCompanyBasedPassword, generateEmployeeId } from "../../helpers/helperFunctions";
import { ICompanyDocument } from "../../interfaces/company/company.types";
import { CompanyRepository } from "../../repositories/company/companyRepository";
import { IAttendance, ILeave } from "../../interfaces/company/IAttendance.types";

export class CompanyService {
  constructor(private readonly employeeRepository:EmployeeRepository,
    private readonly userRepository:IUserRepository,
    private readonly companyRepository:CompanyRepository ,) {}

  async getEmployees(tenantConnection: Connection): Promise<IEmployee[]> {
    try {
      const employees = await this.employeeRepository.getEmployees(tenantConnection);
      return employees;
    } catch (error) {
      console.error("Error in CompanyService.getEmployees:", error);
      throw error;
    }
  }

  async addEmployee(
    employeeData: ICreateEmployee,
    tenantConnection: Connection,
    tenantId: string
  ): Promise<IEmployee | boolean> {
    try {
      const existingUser = await this.userRepository.findByEmail(employeeData.email);
      if (existingUser) throw new Error("This email already exists");
  
      const randomPassword = generateCompanyBasedPassword(tenantId);
      console.log('random Password ',randomPassword)
      const hashPassword = await bcrypt.hash(randomPassword, 10);
  
      const data = {
        email: employeeData.email,
        companyName: tenantId,
        role: employeeData.role,
        password: hashPassword,
        isActive: true
      };
  
      const user = await this.userRepository.createUser(data);
  
      await sendEmail(user.email, "Successfully Registered to the Company", `Your Password is: ${randomPassword}`);
      const  employeeId = generateEmployeeId();

      const newEmployee = await this.employeeRepository.createEmployee(
        { ...employeeData,  employeeId }, 
        tenantConnection
      );
  
      return newEmployee;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile( id:string, connection: Connection, updateData: ICompanyDocument ): Promise<ICompanyDocument> {
    try{

      const updatedCompany = await this.companyRepository.update(id, updateData, connection);
      console.log('updated company',updatedCompany)
      if (!updatedCompany) {
        throw new Error('Employee not found');
      }
  
      return updatedCompany;
    } catch (error) {
      console.error("Error in CompanyService.getEmployeeProfile:", error);
      throw error;
  }
  }
  


  async updateEmployee(
    id: string,
    updateData: IUpdateEmployee,
    connection: Connection
  ): Promise<IEmployee> {
    if (!id || !updateData) {
      throw new Error('Employee ID and update data are required');
    }

    const updatedEmployee = await this.employeeRepository.update(id, updateData, connection);
    if (!updatedEmployee) {
      throw new Error('Employee not found');
    }

    return updatedEmployee;
  }



  
  async getCompanyByEmail(
    email: string,
    tenantConnection: Connection
  ): Promise<ICompanyDocument | null> {
    try {
     const company = this.companyRepository.getCompanyByEmail(
        email,
        tenantConnection
      );
   
      return company
    } catch (error) {
      console.error("Error fetching company:", error);
      throw new Error("Failed to retrieve company data");
    }
  }



  async getLeaves(
    connection: Connection,
    page: number,
    limit: number,
    startDate?: string,
    endDate?: string,
    status?: string
  ): Promise<{ leaves: ILeave[]; total: number }> {
    try {
      return await this.companyRepository.getLeaveRequests(
        connection,
        page,
        limit,
        startDate,
        endDate,
        status
      );
    } catch (error) {
      throw error;
    }
  }


  async updateLeaveStatus(
    leaveId: string,
    status: string,
    connection: Connection
  ): Promise<ILeave> {
    try {
      const updatedLeave = await this.companyRepository.updateLeaveStatus(
        leaveId,
        status,
        connection
      );
  
      if (!updatedLeave) {
        throw new Error('Leave request not found');
      }
  
      if (updatedLeave.employeeId) {
        const employee = await this.companyRepository.findById(
          updatedLeave.employeeId.toString(),
          connection
        );
        
        if (employee && employee.email) {
          const statusMessage = `Your leave request from ${new Date(updatedLeave.startDate).toLocaleDateString()} to ${new Date(updatedLeave.endDate).toLocaleDateString()} has been ${status.toLowerCase()}.`;
          
          await sendEmail(
            employee.email,
            "Leave Request Status Update",
            statusMessage
          );
        }
      }
  
      return updatedLeave;
    } catch (error) {
      throw error;
    }
  }

  async getAttendance(
    connection: Connection,
    page: number,
    limit: number,
    date?: string
): Promise<{ attendance: IAttendance[]; total: number }> {
    try {
        return await this.companyRepository.getAttendanceRecords(
            connection,
            page,
            limit,
            date
        );
    } catch (error) {
        throw error;
    }
}
}