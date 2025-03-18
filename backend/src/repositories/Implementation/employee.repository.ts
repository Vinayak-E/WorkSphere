import { Connection, Types } from 'mongoose';
import { inject, injectable } from 'tsyringe';
import BaseRepository from '../baseRepository';
import { EmployeeSchema } from '../../models/employeeModel';
import { DepartmentSchema } from '../../models/departmentModel';
import { IEmployeeRepository } from '../Interface/IEmployeeRepository';
import {
  IEmployee,
  IEmployeeStats,
} from '../../interfaces/company/IEmployee.types';

@injectable()
export class EmployeeRepository
  extends BaseRepository<IEmployee>
  implements IEmployeeRepository
{
  constructor(@inject('MainConnection') mainConnection: Connection) {
    super('Employee', EmployeeSchema, mainConnection);
  }

  async getEmployees(connection: Connection): Promise<IEmployee[] | null> {
    const model = this.getModel(connection);
    if (!connection.models['Department']) {
      connection.model('Department', DepartmentSchema);
    }
    return await model.find().populate('department').exec();
  }

  async getEmployeeByEmail(
    connection: Connection,
    email: string
  ): Promise<IEmployee | null> {
    const model = this.getModel(connection);
    if (!connection.models['Department']) {
      connection.model('Department', DepartmentSchema);
    }
    return await model.findOne({ email }).populate('department').exec();
  }

  async getEmployeeById(
    connection: Connection,
    id: string | Types.ObjectId
  ): Promise<IEmployee | null> {
    const model = this.getModel(connection);
    return await model.findById(id).populate('department').exec();
  }

  async createEmployee(
    employeeData: Partial<IEmployee>,
    connection: Connection
  ): Promise<IEmployee> {
    return await this.create(employeeData, connection);
  }

  async getDepartmentEmployees(
    connection: Connection,
    departmentId: string | Types.ObjectId
  ): Promise<IEmployee[]> {
    const model = this.getModel(connection);
    return await model
      .find({ department: departmentId })
      .populate('department')
      .select('name email role department')
      .exec();
  }

  async getEmployeeStats(connection: Connection): Promise<IEmployeeStats> {
    const employeeModel = this.getModel(connection);
    if (!connection.models['Department']) {
      connection.model('Department', DepartmentSchema);
    }
    const total = await employeeModel.countDocuments().exec();
    const byDepartment = await employeeModel
      .aggregate([
        {
          $lookup: {
            from: 'departments',
            localField: 'department',
            foreignField: '_id',
            as: 'departmentInfo',
          },
        },
        { $unwind: '$departmentInfo' },
        {
          $group: {
            _id: '$department',
            name: { $first: '$departmentInfo.name' },
            count: { $sum: 1 },
          },
        },
      ])
      .exec();
    const workload = await employeeModel
      .aggregate([
        {
          $lookup: {
            from: 'tasks',
            localField: '_id',
            foreignField: 'assignee',
            as: 'tasks',
          },
        },
        { $project: { name: 1, taskCount: { $size: '$tasks' } } },
        { $sort: { taskCount: -1 } },
        { $limit: 5 },
      ])
      .exec();
    return { total, byDepartment, workload };
  }
}
