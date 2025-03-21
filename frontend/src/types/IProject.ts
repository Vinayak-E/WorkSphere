import { IEmployee } from "./IEmployee";

export interface IProject {
  _id: string;
  name: string;
  description: string;

  deadline: Date |string;
  department: string | {  
    _id: string;
    name: string;
  };
 manager: string | {  
    _id: string;
    name: string;
  };
  employees: string[];
  tasks: ITask[];
  status: "Pending" | "In Progress" | "Completed";
  createdAt?: string;
  totalTasks?: number;      
  completedTasks?: number; 
}
export interface ProjectQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  department?: string;
  employeeId?: string;
}

export interface ICreateProject {
  name: string;
  description: string;
  deadline: string;
  status: "Pending" | "In Progress" | "Completed";
}

export interface ITask {
  _id?: string;
  title: string;
  description: string;
  assignee: string | IEmployee;
  deadline: string;
  status?: "Pending" | "In Progress" | "Completed";
  statusHistory?:{ status: string; timestamp: string; comment?: string }[];
}


