import { Connection } from 'mongoose';
import { inject, injectable } from 'tsyringe';
import BaseRepository from '../baseRepository';
import { DepartmentSchema } from '../../models/departmentModel';
import { IDepartmentRepository } from '../Interface/IDepartmentRepository';
import {  ICreateDepartment, IDepartment, IUpdateDepartment } from '../../interfaces/company/IDepartment.types';

@injectable()
export class DepartmentRepository extends BaseRepository<IDepartment>  implements IDepartmentRepository{
  constructor(@inject('MainConnection') mainConnection: Connection) {
    super('Department', DepartmentSchema, mainConnection);
  }

  async getDepartments(connection: Connection): Promise<IDepartment[]> {
    return await this.findAll({}, connection);
  }

  async createDepartment(departmentData: ICreateDepartment, connection: Connection): Promise<IDepartment> {
    return await this.create(departmentData, connection);
  }

  async findDepartmentByName(name: string, connection: Connection): Promise<IDepartment | null> {
    return await this.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } }, connection);
  }

  async findById(id: string, connection: Connection): Promise<IDepartment | null> {
    return await this.findById(id, connection);
  }

  async update(id: string, updateData: IUpdateDepartment, connection: Connection): Promise<IDepartment | null> {
    const model = this.getModel(connection);
    return await model.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  }
}