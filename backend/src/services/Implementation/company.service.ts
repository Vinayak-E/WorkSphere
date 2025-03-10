import bcrypt from 'bcryptjs';
import { Connection } from 'mongoose';
import { sendEmail } from '../../utils/email';
import { injectable, inject } from 'tsyringe';
import { IEmployee, ICreateEmployee, IUpdateEmployee } from '../../interfaces/company/IEmployee.types';
import { ICompanyDocument } from '../../interfaces/company/company.types';
import { generateCompanyBasedPassword, generateEmployeeId } from '../../helpers/helperFunctions';
import { UserRepository } from '../../repositories/Implementation/user.repository';
import { EmployeeRepository } from '../../repositories/Implementation/employee.repository';
import { CompanyRepository } from '../../repositories/Implementation/company.repository';


@injectable()
export class CompanyService {
  constructor(
    @inject('EmployeeRepository') private readonly employeeRepository: EmployeeRepository,
    @inject('UserRepository') private readonly userRepository: UserRepository,
    @inject('CompanyRepository') private readonly companyRepository: CompanyRepository
  ) {}

  async getEmployees(tenantConnection: Connection): Promise<IEmployee[] | null>  {
    return await this.employeeRepository.getEmployees(tenantConnection);
  }

  async addEmployee(
    employeeData: Partial <IEmployee>,
    tenantConnection: Connection,
    tenantId: string
  ): Promise<IEmployee> {

    if(!employeeData.email) {
        throw new Error('Email Not found');
      }
    const existingUser = await this.userRepository.findByEmail(employeeData.email);
    if (existingUser) {
      throw new Error('This email already exists');
    }


    const randomPassword = generateCompanyBasedPassword(tenantId);
    console.log('Password',randomPassword)
    const hashPassword = await bcrypt.hash(randomPassword, 10);


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
    id: string,
    connection: Connection,
    updateData: ICompanyDocument
  ): Promise<ICompanyDocument> {
    const updatedCompany = await this.companyRepository.update(id, updateData, connection);
    if (!updatedCompany) {
      throw new Error('Company not found');
    }
    return updatedCompany;
  }

  async updateEmployee(
    id: string,
    updateData: IEmployee,
    connection: Connection
  ): Promise<IEmployee> {
    const updatedEmployee = await this.employeeRepository.update(id, updateData, connection);
    if (!updatedEmployee) {
      throw new Error('Employee not found');
    }
    return updatedEmployee;
  }

  async getCompanyByEmail(email: string, tenantConnection: Connection): Promise<ICompanyDocument | null> {
    return await this.companyRepository.getCompanyByEmail(email, tenantConnection);
  }
}
