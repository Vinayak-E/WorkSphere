import { injectable, inject } from 'tsyringe';
import { Connection } from 'mongoose';
import { IEmployee } from '../../interfaces/company/IEmployee.types';
import { IEmployeeRepository } from '../../repositories/Interface/IEmployeeRepository';

@injectable()
export class EmployeeService {
  constructor(
    @inject('EmployeeRepository') private readonly employeeRepository: IEmployeeRepository
  ) {}

  async getEmployeeProfile(connection: Connection, email: string): Promise<IEmployee> {
    const employee = await this.employeeRepository.getEmployeeByEmail(connection, email);
    if (!employee) {
      throw new Error('Employee not found');
    }
    return employee;
  }

  async updateProfile(
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

  async getDepartmentEmployees(connection: Connection, userEmail: string): Promise<IEmployee[]> {

    const currentEmployee = await this.employeeRepository.getEmployeeByEmail(connection, userEmail);
    if (!currentEmployee || !currentEmployee.department) {
      throw new Error('Employee or department not found');
    }
    const departmentId = currentEmployee.department._id;
    const departmentEmployees = await this.employeeRepository.getDepartmentEmployees(connection, departmentId);
    return departmentEmployees.filter((emp) => emp.email !== userEmail);
  }
}
