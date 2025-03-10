import { Connection } from 'mongoose';
import { injectable, inject } from 'tsyringe';
import { IProject } from '../../interfaces/company/IProject.types';
import {
  GetCompanyProjectsOptions,
  GetProjectsOptions,
} from '../../interfaces/company/IProject.types';
import { ProjectRepository } from '../../repositories/Implementation/project.repository';

import { TaskRepository } from '../../repositories/Implementation/task.repository';
import { IProjectService } from '../Interface/IProjectService';
import { EmployeeRepository } from '../../repositories/Implementation/employee.repository';

@injectable()
export class ProjectService implements IProjectService {
  constructor(
    @inject('ProjectRepository') private projectRepository: ProjectRepository,
    @inject('EmployeeRepository')
    private employeeRepository: EmployeeRepository,
    @inject('TaskRepository') private taskRepository: TaskRepository
  ) {}

  async getManagerProjects(
    connection: Connection,
    options: GetProjectsOptions
  ) {
    const { page, limit, search, employeeId } = options;
    const skip = (page - 1) * limit;

    const query = {
      manager: employeeId,
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ],
    };

    const [projects, total] = await Promise.all([
      this.projectRepository.findProjects(connection, query, skip, limit),
      this.projectRepository.countProjects(connection, query),
    ]);

    return {
      data: projects,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async getAllProjects(
    connection: Connection,
    options: GetCompanyProjectsOptions
  ) {
    const { page, limit, search, status, department } = options;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (department) query.department = department;

    const [projects, total] = await Promise.all([
      this.projectRepository.findProjects(connection, query, skip, limit),
      this.projectRepository.countProjects(connection, query),
    ]);

    return {
      data: projects,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async createProject(
    connection: Connection,
    projectData: Partial<IProject>
  ): Promise<IProject> {
    if (!projectData.manager) throw new Error('Manager ID is required');

    const manager = await this.employeeRepository.getEmployeeById(
      connection,
      projectData.manager.toString()
    );
    if (!manager) throw new Error('Manager not found');

    const departmentId = (manager.department as any)._id
      ? (manager.department as any)._id.toString()
      : manager.department.toString();
    const projectToCreate: Partial<IProject> = {
      ...projectData,
      department: departmentId,
      status: 'Pending',
      employees: [],
    };

    return this.projectRepository.createProject(connection, projectToCreate);
  }

  async getProjectById(
    connection: Connection,
    projectId: string
  ): Promise<any> {
    const projectDoc = await this.projectRepository.findProjectById(
      connection,
      projectId
    );
    if (!projectDoc) return null;

    const project = projectDoc.toObject();
    const departmentId = (project.department as any)._id
      ? (project.department as any)._id.toString()
      : project.department.toString();

    const [tasks, departmentEmployees] = await Promise.all([
      this.taskRepository.findTasks(
        connection,
        { project: projectId },
        0,
        1000
      ),
      this.employeeRepository.getDepartmentEmployees(
        connection,
        departmentId
      ),
    ]);

    project.tasks = tasks;
    project.departmentEmployees = departmentEmployees;
    return project;
  }
  async updateProject(
    connection: Connection,
    projectId: string,
    projectData: Partial<IProject>
  ): Promise<IProject | null> {
    return this.projectRepository.updateProject(
      connection,
      projectId,
      projectData
    );
  }

  async updateProjectStatus(
    connection: Connection,
    projectId: string,
    status: string
  ): Promise<IProject | null> {
    return this.projectRepository.updateProject(connection, projectId, {
      status: status as 'Pending' | 'In Progress' | 'Completed',
    });
  }

  async deleteProject(
    connection: Connection,
    projectId: string
  ): Promise<boolean> {
    return this.projectRepository.deleteProject(connection, projectId);
  }
}
