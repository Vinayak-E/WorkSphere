import { Connection, Types } from 'mongoose';
import { IEmployee } from './IEmployee.types';

export interface IProject extends Document {
  _id?: Types.ObjectId;
  name: string;
  isActive: boolean;
  description: string;
  department: Types.ObjectId;
  manager: Types.ObjectId;
  employees: Types.ObjectId[];
  tasks: Types.ObjectId[];
  status: 'Pending' | 'In Progress' | 'Completed';
  createdAt?: Date;
  deadline?: Date;
}

export interface ITask extends Document {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  project: Types.ObjectId;
  assignee: Types.ObjectId;
  status: 'To Do' | 'In Progress' | 'Completed';
  deadline?: Date;
  createdAt?: Date;
}

export interface IProjectService {
  getManagerProjects(
    connection: Connection,
    options: GetProjectsOptions
  ): Promise<{ data: IProject[]; totalPages: number; currentPage: number }>;
  createProject(
    connection: Connection,
    projectData: IProject
  ): Promise<IProject>;
  getProjectDetails(
    connection: Connection,
    projectId: string
  ): Promise<{
    project: IProject | null;
    tasks: ITask[];
    departmentEmployees: IEmployee[];
  }>;

  addTask(connection: Connection, taskData: ITask): Promise<ITask | null>;
  updateProject(
    id: string,
    connection: Connection,
    updateData: IProject
  ): Promise<IProject>;
  updateProjectStatus(
    id: string,
    connection: Connection,
    status: string
  ): Promise<IProject>;
  getEmployeeTasks(
    connection: Connection,
    options: {
      employeeId: string;
      page: number;
      limit: number;
      search?: string;
      status?: string;
    }
  ): Promise<{ data: ITask[]; totalPages: number; currentPage: number }>;
  updateTaskStatus(
    connection: Connection,
    taskId: string,
    status: string
  ): Promise<ITask | null>;
  getAllProjects(
    connection: Connection,
    options: GetCompanyProjectsOptions
  ): Promise<{
    data: IProject[];
    totalPages: number;
    currentPage: number;
  }>;
  updateProjectTask(
    connection: Connection,
    projectId: string,
    taskId: string,
    taskData: Partial<ITask>
  ): Promise<ITask>;
}

export interface GetProjectsOptions {
  page: number;
  limit: number;
  search: string;
  employeeId: string;
}

export interface GetCompanyProjectsOptions {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  department?: string;
}
