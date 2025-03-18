import { Connection } from "mongoose";
import { ICreateDepartment, IDepartment, IUpdateDepartment } from "../../interfaces/company/IDepartment.types";

export interface IDepartmentRepository {
    getDepartments(connection: Connection): Promise<IDepartment[]>
    createDepartment(departmentData: ICreateDepartment, connection: Connection): Promise<IDepartment>
    findDepartmentByName(name: string, connection: Connection): Promise<IDepartment | null>
    findById(id: string, connection: Connection): Promise<IDepartment | null>
    update(id: string, updateData: IUpdateDepartment, connection: Connection): Promise<IDepartment | null>
}