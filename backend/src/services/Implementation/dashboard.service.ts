import { Connection } from "mongoose";
import { inject, injectable } from "tsyringe";
import { IDashboardData } from "../../interfaces/company/company.types";
import { ITaskRepository } from "../../repositories/Interface/ITaskRepository";
import { IProjectRepository } from "../../repositories/Interface/IProjectRepository";
import { IEmployeeRepository } from "../../repositories/Interface/IEmployeeRepository";

@injectable()
export class DashboardService {
  constructor(
    @inject('ProjectRepository') private projectRepository: IProjectRepository,
    @inject('TaskRepository') private taskRepository: ITaskRepository,
    @inject('EmployeeRepository') private employeeRepository: IEmployeeRepository
  ) {}

  async getDashboardData(tenantConnection: Connection): Promise<IDashboardData> {
    const [projectStats, taskStats, employeeStats] = await Promise.all([
      this.projectRepository.getProjectStats(tenantConnection),
      this.taskRepository.getTaskStats(tenantConnection),
      this.employeeRepository.getEmployeeStats(tenantConnection)
    ]);

    return {
      projects: projectStats,
      tasks: taskStats,
      employees: employeeStats
    };
  }
}