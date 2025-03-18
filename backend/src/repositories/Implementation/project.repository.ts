import { Connection, Model } from 'mongoose';
import { inject, injectable } from 'tsyringe';
import { IProject, IProjectStats } from '../../interfaces/company/IProject.types';
import { ProjectSchema } from '../../models/projectModel';
import { DepartmentSchema } from '../../models/departmentModel';
import { EmployeeSchema } from '../../models/employeeModel';
import BaseRepository from '../baseRepository';
import { IProjectRepository } from '../Interface/IProjectRepository';

@injectable()
export class ProjectRepository
  extends BaseRepository<IProject>
  implements IProjectRepository
{
  constructor(@inject('MainConnection') mainConnection: Connection) {
    super('Project', ProjectSchema, mainConnection);
  }

  async findProjects(
    connection: Connection,
    query: any,
    skip: number,
    limit: number
  ): Promise<IProject[]> {
    const projectModel = this.getModel(connection);

    if (!connection.models['Department']) {
      connection.model('Department', DepartmentSchema);
    }
    if (!connection.models['Employee']) {
      connection.model('Employee', EmployeeSchema);
    }
    return projectModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .populate('department manager employees')
      .exec();
  }

  async countProjects(connection: Connection, query: any): Promise<number> {
    const projectModel = this.getModel(connection);
    return projectModel.countDocuments(query).exec();
  }

  async createProject(
    connection: Connection,
    projectData: Partial<IProject>
  ): Promise<IProject> {
    return await this.create(projectData, connection);
  }

  async findProjectById(
    connection: Connection,
    projectId: string
  ): Promise<IProject | null> {
    const projectModel = this.getModel(connection);
    if (!connection.models['Department']) {
      connection.model('Department', DepartmentSchema);
    }
    if (!connection.models['Employee']) {
      connection.model('Employee', EmployeeSchema);
    }
    return projectModel
      .findById(projectId)
      .populate('department manager employees')
      .exec();
  }

  async updateProject(
    connection: Connection,
    projectId: string,
    projectData: Partial<IProject>
  ): Promise<IProject | null> {
    return await this.update(projectId, projectData, connection);
  }

  async deleteProject(
    connection: Connection,
    projectId: string
  ): Promise<boolean> {
    const deleted = await this.delete(projectId, connection);
    return deleted !== null;
  }

  async addEmployeeToProject(
    connection: Connection,
    projectId: string,
    employeeId: string
  ): Promise<void> {
    const projectModel = this.getModel(connection);
    await projectModel
      .findByIdAndUpdate(projectId, { $addToSet: { employees: employeeId } })
      .exec();
  }
  async getProjectStats(connection: Connection):Promise<IProjectStats> {
    const projectModel = this.getModel(connection);
    const total = await projectModel.countDocuments().exec();
    const statusChart = await projectModel
      .aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
      .exec();

    return { total, statusChart };
  }
}
