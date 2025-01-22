import { IDepartment, ICreateDepartment, IUpdateDepartment } from "../../interfaces/company/IDepartment.types";
import { DepartmentRepository } from "../../repositories/company/departmentRepository";
import { Connection } from "mongoose";

export class DepartmentService {
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  async getDepartments(tenantConnection: Connection): Promise<IDepartment[]> {
    try {
      const departments = await this.departmentRepository.getDepartments(tenantConnection);
      return departments;
    } catch (error) {
      console.error("Error in DepartmentService.getDepartments:", error);
      throw error;
    }
  }

  async addNewDepartment( departmentData: ICreateDepartment, 
    tenantConnection:Connection): Promise<IDepartment> {
    try {

      const existingDepartment = await this.departmentRepository.findDepartmentByName(
        departmentData.name, tenantConnection
      );

      if (existingDepartment) {
        throw new Error("Department with this name already exists");
      }
      console.log('service',departmentData)

      const newDepartment = await this.departmentRepository.createDepartment( departmentData, 
        tenantConnection);
      console.log('newDepartmetdata',newDepartment)
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
  const existingDepartment = await this.departmentRepository.findDepartmentByName(
    updateData.name,
    connection
  );

  if (existingDepartment && existingDepartment._id.toString() !== id) {
    throw new Error("Department with this name already exists");
  }
}

    const updatedDepartment = await this.departmentRepository.update(id, updateData, connection);
    if (!updatedDepartment) {
      throw new Error('Department not found');
    }

    return updatedDepartment;
  }


}