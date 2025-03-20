import { Connection } from 'mongoose';
import { inject, injectable } from 'tsyringe';
import { ITask, ITaskStats } from '../../interfaces/company/IProject.types';
import { ProjectSchema } from '../../models/projectModel';
import BaseRepository from '../baseRepository';
import { TaskSchema } from '../../models/taskModel';
import { ITaskRepository } from '../Interface/ITaskRepository';

@injectable()
export class TaskRepository extends BaseRepository<ITask>  implements ITaskRepository {
  constructor(@inject('MainConnection') mainConnection: Connection) {
    super('Task', TaskSchema,mainConnection);
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
    return await this.create(taskData,connection);
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
    return await this.update(taskId, taskData,connection);
  }

  async deleteTask(connection: Connection, taskId: string): Promise<boolean> {
    const deleted = await this.delete(taskId,connection);
    return deleted !== null;
  }


  async getTaskStats(connection: Connection): Promise<ITaskStats> {
    const taskModel = this.getModel(connection);
    const total = await taskModel.countDocuments().exec();
    const statusChart = await taskModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).exec();
    const overdue = await taskModel.countDocuments({ deadline: { $lt: new Date() }, status: { $ne: 'Completed' } }).exec();
    const dueSoon = await taskModel.countDocuments({
      deadline: { $gte: new Date(), $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      status: { $ne: 'Completed' }
    }).exec();
    return { total, statusChart, overdue, dueSoon };
  }


  async updateTaskStatus(connection: Connection, taskId: string, status: string, comment: string): Promise<ITask | null> {
    const taskModel = this.getModel(connection);
    if (!connection.models['Project']) {
      connection.model('Project', ProjectSchema);
    }
    return taskModel.findByIdAndUpdate(
      taskId,
      {
        $set: { status },
        $push: {
          statusHistory: {
            status,
            timestamp: new Date(),
            comment
          }
        }
      },
      { new: true }
    ).populate('assignee project').exec();
  }
}
