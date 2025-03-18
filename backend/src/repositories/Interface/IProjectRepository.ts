import { Connection } from 'mongoose';
import { IProject } from '../../interfaces/company/IProject.types';

export interface IProjectRepository {
  findProjects(connection: Connection, query: any, skip: number, limit: number): Promise<IProject[]>;
  countProjects(connection: Connection, query: any): Promise<number>;
  createProject(connection: Connection, projectData: Partial<IProject>): Promise<IProject>;
  findProjectById(connection: Connection, projectId: string): Promise<IProject | null>;
  updateProject(connection: Connection, projectId: string, projectData: Partial<IProject>): Promise<IProject | null>;
  deleteProject(connection: Connection, projectId: string): Promise<boolean>;
  addEmployeeToProject(connection: Connection, projectId: string, employeeId: string): Promise<void>;
  getProjectStats(connection: Connection): Promise<any>
}