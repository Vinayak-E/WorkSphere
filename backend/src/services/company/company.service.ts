import { IEmployee,ICreateEmployee, IUpdateEmployee } from "../../interfaces/company/IEmployee.types";
import { sendEmail } from "../../utils/email";
import bcrypt from 'bcryptjs'
import { Connection } from "mongoose";
import { EmployeeRepository } from "../../repositories/company/employeeRepository";
import { IUserRepository } from "../../interfaces/IUser.types";
import { envConfig } from "../../configs/envConfig";
import { generateCompanyBasedPassword, generateEmployeeId } from "../../helpers/helperFunctions";
import { ICompanyDocument } from "../../interfaces/company/company.types";
import { CompanyRepository } from "../../repositories/company/companyRepository";

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
      return this.companyRepository.getCompanyByEmail(
        email,
        tenantConnection, 
      );
    } catch (error) {
      console.error("Error fetching company:", error);
      throw new Error("Failed to retrieve company data");
    }
  }

}