import { Connection, Model } from 'mongoose';
import { injectable } from 'tsyringe';
import { IProject } from '../../interfaces/company/IProject.types';
import { ProjectSchema } from '../../models/projectModel';
import { departmentSchema } from '../../models/departmentModel';
import { EmployeeSchema } from '../../models/employeeModel';
import BaseRepository from '../baseRepository';
import { IProjectRepository } from '../Interface/IProjectRepository';


@injectable()
export class ProjectRepository extends BaseRepository<IProject>  implements IProjectRepository{
  constructor() {
    super('Project', ProjectSchema);
  }

  async findProjects(
    connection: Connection,
    query: any,
    skip: number,
    limit: number
  ): Promise<IProject[]> {
    const projectModel = this.getModel(connection);

    if (!connection.models['Department']) {
      connection.model('Department', departmentSchema);
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
    return await this.create(connection, projectData);
  }

  async findProjectById(
    connection: Connection,
    projectId: string
  ): Promise<IProject | null> {
    const projectModel = this.getModel(connection);
    if (!connection.models['Department']) {
      connection.model('Department', departmentSchema);
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
    return await this.update(connection, projectId, projectData);
  }

  async deleteProject(
    connection: Connection,
    projectId: string
  ): Promise<boolean> {
    const deleted = await this.delete(connection, projectId);
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
}
