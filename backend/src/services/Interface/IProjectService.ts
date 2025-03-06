import { Connection } from 'mongoose';
import { IProject } from '../../interfaces/company/IProject.types';
import { GetCompanyProjectsOptions, GetProjectsOptions } from '../../interfaces/company/IProject.types';

export interface IProjectService {
  getManagerProjects(connection: Connection, options: GetProjectsOptions): Promise<{ data: IProject[]; totalPages: number; currentPage: number }>;
  getAllProjects(connection: Connection, options: GetCompanyProjectsOptions): Promise<{ data: IProject[]; totalPages: number; currentPage: number }>;
  createProject(connection: Connection, projectData: Partial<IProject>): Promise<IProject>;
  getProjectById(connection: Connection, projectId: string): Promise<IProject | null>;
  updateProject(connection: Connection, projectId: string, projectData: Partial<IProject>): Promise<IProject | null>;
  updateProjectStatus(connection: Connection, projectId: string, status: string): Promise<IProject | null>;
  deleteProject(connection: Connection, projectId: string): Promise<boolean>;
}