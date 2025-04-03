import bcrypt from 'bcryptjs';
import { Connection } from 'mongoose';
import { sendEmail } from '../../utils/email';
import { injectable, inject } from 'tsyringe';
import { IEmployee } from '../../interfaces/company/IEmployee.types';
import { ICompanyDocument } from '../../interfaces/company/company.types';
import { generateCompanyBasedPassword, generateEmployeeId } from '../../helpers/helperFunctions';
import { IAdminRepository } from '../../repositories/Interface/IAdminRepository';
import { ICompanyRepository } from '../../repositories/Interface/ICompanyRepository';
import { IEmployeeRepository } from '../../repositories/Interface/IEmployeeRepository';
import { IUserRepository } from '../../repositories/Interface/IUserRepository';

@injectable()
export class CompanyService {
  constructor(
    @inject('EmployeeRepository') private readonly employeeRepository: IEmployeeRepository,
    @inject('UserRepository') private readonly userRepository: IUserRepository,
    @inject('CompanyRepository') private readonly companyRepository: ICompanyRepository,
    @inject('AdminRepository') private readonly adminRepository: IAdminRepository
  ) {}

  async getEmployees(tenantConnection: Connection): Promise<IEmployee[] | null> {
    return await this.employeeRepository.getEmployees(tenantConnection);
  }

  async addEmployee(
    employeeData: Partial<IEmployee>,
    tenantConnection: Connection,
    tenantId: string
  ): Promise<IEmployee> {
    if (!employeeData.email) {
      throw new Error('Email Not found');
    }
    const existingUser = await this.userRepository.findByEmail(employeeData.email);
    if (existingUser) {
      throw new Error('This email already exists');
    }

    const randomPassword = generateCompanyBasedPassword(tenantId);
    const hashPassword = await bcrypt.hash(randomPassword, 10);
    console.log('password',randomPassword)
    const userData = {
      email: employeeData.email,
      companyName: tenantId,
      role: employeeData.role,
      password: hashPassword,
      isActive: true,
    };

    const user = await this.userRepository.createUser(userData);
    await sendEmail(
      user.email,
      'Successfully Registered to the Company',
      `Your Password is: ${randomPassword}`
    );

    const employeeId = generateEmployeeId();
    const newEmployee = await this.employeeRepository.createEmployee(
      { ...employeeData, employeeId },
      tenantConnection
    );
    return newEmployee;
  }

  async updateProfile(
    companId: string,
    connection: Connection,
    updateData: ICompanyDocument
  ): Promise<ICompanyDocument> {
    const updatedCompany = await this.companyRepository.update(companId, updateData, connection);
    if (!updatedCompany) {
      throw new Error('Company not found');
    }
    return updatedCompany;
  }

  async updateEmployee(
    employeeId: string,
    updateData: IEmployee,
    connection: Connection
  ): Promise<IEmployee> {
    const updatedEmployee = await this.employeeRepository.update(employeeId, updateData, connection);
    if (!updatedEmployee) {
      throw new Error('Employee not found');
    }
    return updatedEmployee;
  }

  async getCompanyByEmail(email: string, tenantConnection: Connection): Promise<ICompanyDocument | null> {
    const companyData = await this.companyRepository.findByEmail(email, tenantConnection);
    const userData = await this.userRepository.findByEmail(email); 
    if (!companyData || !userData) return null;
    (companyData as ICompanyDocument).isActive = userData.isActive;
    return companyData;
  }

  async getCompanyById(companyId: string, tenantConnection: Connection): Promise<ICompanyDocument | null> {
    return await this.companyRepository.findById(companyId, tenantConnection);
  }

  async updateCompanySubscription(
    companyId: string,
    subscriptionData: Partial<ICompanyDocument>,
    tenantConnection: Connection
  ): Promise<ICompanyDocument> {
    const updatedCompany = await this.companyRepository.update(companyId, subscriptionData, tenantConnection);
    if (!updatedCompany) {
      throw new Error('Company not found');
    }
    console.log('upadatedcompany',updatedCompany)
    const company = updatedCompany.email
    console.log("company",company)
    const mainCompany = await this.adminRepository.findOne({email: company});
    console.log('main',mainCompany)
    if (mainCompany) {
     
      await this.adminRepository.update(mainCompany._id, {
        subscriptionPlan: subscriptionData.subscriptionPlan,
        subscriptionStatus: subscriptionData.subscriptionStatus,
        subscriptionStartDate: subscriptionData.subscriptionStartDate,
        subscriptionEndDate: subscriptionData.subscriptionEndDate
      });
    }
  
    return updatedCompany;
  }
}