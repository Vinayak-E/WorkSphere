import { Connection } from 'mongoose';
import { ITask } from '../../interfaces/company/IProject.types';

export interface ITaskService {
  getTasks(connection: Connection, query: any, page: number, limit: number): Promise<{ tasks: ITask[]; total: number }>;
  getEmployeeTasks(connection: Connection, options: { employeeId: string; page: number; limit: number; search?: string; status?: string }): Promise<{ data: ITask[]; totalPages: number; currentPage: number }>;
  createTask(connection: Connection, taskData: Partial<ITask>): Promise<ITask>;
  getTaskById(connection: Connection, taskId: string): Promise<ITask | null>;
  updateTask(connection: Connection, taskId: string, taskData: Partial<ITask>): Promise<ITask | null>;
  updateTaskStatus(connection: Connection, taskId: string, status: string, comment: string): Promise<ITask | null>
  deleteTask(connection: Connection, taskId: string): Promise<boolean>;
}