import { IEmployee } from "../../interfaces/company/IEmployee.types";
import { ICompanySignup } from "../../interfaces/company/company.types";
import { Connection } from "mongoose";

export interface IEmployeeService {
    getEmployeeProfile(connection: Connection, email: string): Promise<IEmployee>
   
   }
   