import { IEmployee } from "./IEmployee";

export interface IProject {
    _id?: string; 
    name: string;
    description: string;
    department: string;
    deadline:Date;
    manager: string;    
    employees: string[]; 
    tasks: ITask[];   
    status: 'Pending' | 'In Progress' | 'Completed';
    createdAt?: string;
  }
  export interface ProjectQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    department?: string;
    employeeId?:string;
  }

  export interface ICreateProject {
    name:string;
    description:string;
    deadline: string
    status: 'Pending' | 'In Progress' | 'Completed';
  }

  export interface ITask {
    _id?: string;
    title: string;
    description: string;
    assignee: string;
    deadline: string;
    status?: 'Pending' | 'In Progress' | 'Completed';
  }

  export interface ProjectResponse {
    success: boolean;
    data: {
      project: IProject;
      departmentEmployees: IEmployee[];
    };
  }