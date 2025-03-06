import { Connection } from 'mongoose';
import { injectable } from 'tsyringe';
import { ITask } from '../../interfaces/company/IProject.types';
import { ProjectSchema } from '../../models/projectModel';
import BaseRepository from '../baseRepository';
import { TaskSchema } from '../../models/taskModel';
import { ITaskRepository } from '../Interface/ITaskRepository';

@injectable()
export class TaskRepository extends BaseRepository<ITask>  implements ITaskRepository {
  constructor() {
    super('Task', TaskSchema);
  }

  async findTasks(
    connection: Connection,
    query: any,
    skip: number,
    limit: number
  ): Promise<ITask[]> {
    const taskModel = this.getModel(connection);
    if (!connection.models['Project']) {
      connection.model('Project', ProjectSchema);
    }
    return taskModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .populate('assignee project')
      .exec();
  }

  async countTasks(connection: Connection, query: any): Promise<number> {
    const taskModel = this.getModel(connection);
    return taskModel.countDocuments(query).exec();
  }

  async createTask(
    connection: Connection,
    taskData: Partial<ITask>
  ): Promise<ITask> {
    return await this.create(connection, taskData);
  }

  async findTaskById(
    connection: Connection,
    taskId: string
  ): Promise<ITask | null> {
    const taskModel = this.getModel(connection);
    return taskModel.findById(taskId).populate('assignee project').exec();
  }

  async updateTask(
    connection: Connection,
    taskId: string,
    taskData: Partial<ITask>
  ): Promise<ITask | null> {
    return await this.update(connection, taskId, taskData);
  }

  async deleteTask(connection: Connection, taskId: string): Promise<boolean> {
    const deleted = await this.delete(connection, taskId);
    return deleted !== null;
  }
}
