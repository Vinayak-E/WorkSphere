import Department from "../../models/departmentModel";
import { IDepartment } from "../../interfaces/company/IDepartment.types";
import { ICreateEmployee, IEmployee, IUpdateEmployee } from "../../interfaces/company/IEmployee.types";
import { Connection } from "mongoose";
import { Model } from "mongoose";
import Employee from "../../models/employeeModel";

export class EmployeeRepository {
    private getEmployeeModel(connection: Connection): Model<IEmployee> {
        return connection.models.Employee || connection.model<IEmployee>("Employee", Employee.schema);
    }


    private getDepartmentModel(connection: Connection): Model<IDepartment> {
        return connection.models.Department || connection.model<IDepartment>("Department", Department.schema);
    }

    async getEmployees(connection: Connection): Promise<IEmployee[]> {
        try {
        
            const EmployeeModel = this.getEmployeeModel(connection);
            const DepartmentModel = this.getDepartmentModel(connection);

            return await EmployeeModel.find()
                .populate('department')
                .exec();
        } catch (error) {
            throw error;
        }
    }

   
    async createEmployee(employeeData: ICreateEmployee, connection: Connection): Promise<IEmployee> {
        try {
            const EmployeeModel = this.getEmployeeModel(connection);
            const employee = new EmployeeModel(employeeData);
            return await employee.save();
        } catch (error) {
            throw error;
        }
    }


    
    async update(id: string, updateData: IUpdateEmployee, connection: Connection): Promise<IEmployee | null> {
        const EmployeeModel = this.getEmployeeModel(connection);
        return await EmployeeModel.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true, runValidators: true }
        );
      }
}
