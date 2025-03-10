import { inject, injectable } from 'tsyringe';
import { Connection,  Types } from 'mongoose';
import {  ICreateEmployee, IEmployee, IUpdateEmployee } from '../../interfaces/company/IEmployee.types';
import  { EmployeeSchema } from '../../models/employeeModel';
import BaseRepository from '../baseRepository';
import  { DepartmentSchema } from '../../models/departmentModel';

@injectable()
export class EmployeeRepository extends BaseRepository<IEmployee> {
    constructor(@inject('MainConnection') mainConnection: Connection) {
        super('Employee', EmployeeSchema,mainConnection);
      }


      async getEmployees(connection: Connection): Promise<IEmployee[] | null> {
        const model = this.getModel(connection);
        if (!connection.models['Department']) {
          connection.model('Department', DepartmentSchema);
        }
        return await model.find().populate('department').exec();
      }

  async getEmployeeByEmail(connection: Connection, email: string): Promise<IEmployee | null> {
    const model = this.getModel(connection);
    if (!connection.models['Department']) {
        connection.model('Department', DepartmentSchema);
      }
    return await model.findOne({ email }).populate('department').exec();
  }

  async getEmployeeById(connection: Connection, id: string | Types.ObjectId): Promise<IEmployee | null> {
    const model = this.getModel(connection);
    return await model.findById(id).populate('department').exec();
  }

  async createEmployee(employeeData:Partial<IEmployee>, connection: Connection): Promise<IEmployee> {
    return await this.create(employeeData,connection)
  }

  async getDepartmentEmployees(connection: Connection, departmentId: string | Types.ObjectId): Promise<IEmployee[]> {
    const model = this.getModel(connection);
    return await model.find({ department: departmentId })
      .populate('department')
      .select('name email role department')
      .exec();
  }
}
