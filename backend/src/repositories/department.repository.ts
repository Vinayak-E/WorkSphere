import { Connection, Model } from 'mongoose';
import Department from '../models/departmentModel';
import {
  ICreateDepartment,
  IDepartment,
  IUpdateDepartment,
} from '../interfaces/company/IDepartment.types';

export class DepartmentRepository {
  private getDepartmentModel(connection: Connection): Model<IDepartment> {
    return (
      connection.models.Department ||
      connection.model<IDepartment>('Department', Department.schema)
    );
  }

  async getDepartments(connection: Connection): Promise<IDepartment[]> {
    try {
      const DepartmentModel = this.getDepartmentModel(connection);
      return await DepartmentModel.find();
    } catch (error) {
      throw error;
    }
  }

  async createDepartment(
    departmentData: ICreateDepartment,
    connection: Connection
  ): Promise<IDepartment> {
    try {
      const DepartmentModel = this.getDepartmentModel(connection);
      const department = new DepartmentModel(departmentData);
      return await department.save();
    } catch (error) {
      throw error;
    }
  }

  async findDepartmentByName(
    name: string,
    connection: Connection
  ): Promise<IDepartment | null> {
    const DepartmentModel = this.getDepartmentModel(connection);
    return await DepartmentModel.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    });
  }
  async findById(
    id: string,
    connection: Connection
  ): Promise<IDepartment | null> {
    const DepartmentModel = this.getDepartmentModel(connection);
    return await DepartmentModel.findById(id);
  }

  async update(
    id: string,
    updateData: IUpdateDepartment,
    connection: Connection
  ): Promise<IDepartment | null> {
    const DepartmentModel = this.getDepartmentModel(connection);
    return await DepartmentModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }
}
