import { Connection } from 'mongoose';
import { injectable, inject } from 'tsyringe';
import { ITask } from '../../interfaces/company/IProject.types';
import { ITaskService } from '../Interface/ITaskService';
import { IProjectRepository } from '../../repositories/Interface/IProjectRepository';
import { ITaskRepository } from '../../repositories/Interface/ITaskRepository';



@injectable()
export class TaskService implements ITaskService {
  constructor(
    @inject('TaskRepository') private taskRepository: ITaskRepository,
    @inject('ProjectRepository') private projectRepository: IProjectRepository
  ) {}

  async getTasks(connection: Connection, query: any, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [tasks, total] = await Promise.all([
      this.taskRepository.findTasks(connection, query, skip, limit),
      this.taskRepository.countTasks(connection, query),
    ]);
    return { tasks, total };
  }

  async getEmployeeTasks(connection: Connection, options: { employeeId: string; page: number; limit: number; search?: string; status?: string }) {
    const { employeeId, page, limit, search = '', status = '' } = options;
    const skip = (page - 1) * limit;

    const query: any = { assignee: employeeId };
    if (search) query.title = { $regex: search, $options: 'i' };
    if (status) query.status = status;

    const [tasks, total] = await Promise.all([
      this.taskRepository.findTasks(connection, query, skip, limit),
      this.taskRepository.countTasks(connection, query),
    ]);

    return {
      data: tasks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async createTask(connection: Connection, taskData: Partial<ITask>): Promise<ITask> {
    const task = await this.taskRepository.createTask(connection, taskData);
    if (task.assignee && task.project) {
      await this.projectRepository.addEmployeeToProject(connection, task.project.toString(), task.assignee.toString());
    }
    return task;
  }

  async getTaskById(connection: Connection, taskId: string): Promise<ITask | null> {
    return this.taskRepository.findTaskById(connection, taskId);
  }

  async updateTask(connection: Connection, taskId: string, taskData: Partial<ITask>): Promise<ITask | null> {
    const updatedTask = await this.taskRepository.updateTask(connection, taskId, taskData);
    if (updatedTask && taskData.assignee && updatedTask.project) {
      await this.projectRepository.addEmployeeToProject(connection, updatedTask.project.toString(), taskData.assignee.toString());
    }
    return updatedTask;
  }

  async updateTaskStatus(connection: Connection, taskId: string, status: string): Promise<ITask | null> {
    return this.taskRepository.updateTask(connection, taskId, { status: status as  "In Progress" | "Completed" | "To Do" });
  }

  async deleteTask(connection: Connection, taskId: string): Promise<boolean> {
    return this.taskRepository.deleteTask(connection, taskId);
  }
}