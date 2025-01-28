import { ICompanySignup } from "../../interfaces/company/company.types";

export interface IEmployeeService {
    getEmployeeProfile(data: ICompanySignup): Promise<string | boolean | null | { message: string }>

    
   
   }
   