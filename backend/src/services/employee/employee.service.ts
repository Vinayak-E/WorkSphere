import mongoose, { Connection } from 'mongoose';
import {
  IEmployee,
  IUpdateEmployee,
} from '../../interfaces/company/IEmployee.types';
import { EmployeeRepository } from '../../repositories/employee/employeeRepository';
import { IUserRepository } from '../../interfaces/IUser.types';

export class EmployeeService {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async getEmployeeProfile(
    connection: Connection,
    email: string
  ): Promise<IEmployee> {
    try {
      const employee = await this.employeeRepository.getEmployeeByEmail(
        connection,
        email
      );
      if (!employee) {
        throw new Error('Employee not found');
      }

      return employee;
    } catch (error) {
      console.error('Error in CompanyService.getEmployeeProfile:', error);
      throw error;
    }
  }

  async updateProfile(
    id: string,
    connection: Connection,
    updateData: IUpdateEmployee
  ): Promise<IEmployee> {
    try {
      const updatedEmployee = await this.employeeRepository.update(
        id,
        updateData,
        connection
      );
      if (!updatedEmployee) {
        throw new Error('Employee not found');
      }

      return updatedEmployee;
    } catch (error) {
      console.error('Error in CompanyService.getEmployeeProfile:', error);
      throw error;
    }
  }


  async getDepartmentEmployees(
    connection: Connection,
    userEmail: string
  ): Promise<IEmployee[]> {
    try {
      const currentEmployee = await this.employeeRepository.getEmployeeByEmail(
        connection,
        userEmail
      );

      if (!currentEmployee || !currentEmployee.department) {
        throw new Error('Employee or department not found');
      }

      const departmentId = currentEmployee.department._id;

      console.log('departmentId', departmentId);
      const departmentEmployees =
        await this.employeeRepository.getEmployeesByDepartment(
          connection,
          departmentId
        );

      console.log('departmentEmplopyees', departmentEmployees);
      return departmentEmployees.filter((emp) => emp.email !== userEmail);
    } catch (error) {
      console.error('Error in EmployeeService.getDepartmentEmployees:', error);
      throw error;
    }
  }
}
