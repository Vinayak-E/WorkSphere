import { inject, injectable } from 'tsyringe';
import { generateDepartmentId } from '../../helpers/helperFunctions';
import {
  IDepartment,
  ICreateDepartment,
  IUpdateDepartment,
} from '../../interfaces/company/IDepartment.types';
import { DepartmentRepository } from '../../repositories/Implementation/department.repository';
import { Connection } from 'mongoose';

@injectable()
export class DepartmentService {
  constructor( @inject('DepartmentRepository') private departmentRepository: DepartmentRepository,) {}

  async getDepartments(tenantConnection: Connection): Promise<IDepartment[]> {
    try {
      const departments =
        await this.departmentRepository.getDepartments(tenantConnection);
      return departments;
    } catch (error) {
      throw error;
    }
  }

  async addNewDepartment(
    departmentData: ICreateDepartment,
    tenantConnection: Connection
  ): Promise<IDepartment> {
    try {
      const existingDepartment =
        await this.departmentRepository.findDepartmentByName(
          departmentData.name,
          tenantConnection
        );

      if (existingDepartment) {
        throw new Error('Department with this name already exists');
      }
      const departmentId = generateDepartmentId();
      const newDepartmentData = {
        ...departmentData,
        departmentId: departmentId,
      };

      const newDepartment = await this.departmentRepository.createDepartment(
        newDepartmentData,
        tenantConnection
      );
      return newDepartment;
    } catch (error) {
      throw error;
    }
  }

  async updateDepartment(
    id: string,
    updateData: IUpdateDepartment,
    connection: Connection
  ): Promise<IDepartment> {
    if (!id || !updateData) {
      throw new Error('Department ID and update data are required');
    }

    if (updateData.name) {
      const existingDepartment =
        await this.departmentRepository.findDepartmentByName(
          updateData.name,
          connection
        );

      if (existingDepartment && existingDepartment._id.toString() !== id) {
        throw new Error('Department with this name already exists');
      }
    }

    const updatedDepartment = await this.departmentRepository.update(
      id,
      updateData,
      connection
    );
    if (!updatedDepartment) {
      throw new Error('Department not found');
    }

    return updatedDepartment;
  }
}
