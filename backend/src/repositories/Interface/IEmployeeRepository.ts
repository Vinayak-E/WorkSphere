import { Connection, Types } from "mongoose";
import { IEmployee, IEmployeeStats } from "../../interfaces/company/IEmployee.types";

export interface IEmployeeRepository {
    getEmployees(connection: Connection): Promise<IEmployee[] | null>
    getEmployeeByEmail(connection: Connection, email: string): Promise<IEmployee | null>
    getEmployeeById(connection: Connection, id: string | Types.ObjectId): Promise<IEmployee | null>
    createEmployee(employeeData: Partial<IEmployee>, connection: Connection): Promise<IEmployee>
    getDepartmentEmployees(connection: Connection, departmentId: string | Types.ObjectId): Promise<IEmployee[]>
    getEmployeeStats(connection: Connection): Promise<IEmployeeStats>
    update(employeeId: string, updateData: IEmployee, connection: Connection): Promise<IEmployee | null>
}