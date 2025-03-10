import { inject, injectable } from "tsyringe";
import { ProjectRepository } from "../../repositories/Implementation/project.repository";
import { TaskRepository } from "../../repositories/Implementation/task.repository";
import { EmployeeRepository } from "../../repositories/Implementation/employee.repository";
import { Connection } from "mongoose";

@injectable()
export class DashboardService {
  constructor(
    @inject('ProjectRepository') private projectRepository: ProjectRepository,
    @inject('TaskRepository') private taskRepository: TaskRepository,
    @inject('EmployeeRepository') private employeeRepository: EmployeeRepository
  ) {}

  async getDashboardData(tenantConnection: Connection): Promise<any> {
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