import { Connection } from 'mongoose';
import { ITask } from '../../interfaces/company/IProject.types';

export interface ITaskRepository {
  findTasks(connection: Connection, query: any, skip: number, limit: number): Promise<ITask[]>;
  countTasks(connection: Connection, query: any): Promise<number>;
  createTask(connection: Connection, taskData: Partial<ITask>): Promise<ITask>;
  findTaskById(connection: Connection, taskId: string): Promise<ITask | null>;
  updateTask(connection: Connection, taskId: string, taskData: Partial<ITask>): Promise<ITask | null>;
  deleteTask(connection: Connection, taskId: string): Promise<boolean>;
}