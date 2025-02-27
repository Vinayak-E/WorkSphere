import { Connection, Model, connection } from 'mongoose';
import { IProject, ITask } from '../../interfaces/company/IProject.types';
import Project from '../../models/projectModel';
import { IEmployee } from '../../interfaces/company/IEmployee.types';
import Employee from '../../models/employeeModel';
import Task from '../../models/taskModel';
import { IDepartment } from '../../interfaces/company/IDepartment.types';
import Department from '../../models/departmentModel';

export class ProjectRepository {
  private getProjectModel(connection: Connection): Model<IProject> {
    return (
      connection.models.Project ||
      connection.model<IProject>('Project', Project.schema)
    );
  }
  private getEmployeeModel(connection: Connection): Model<IEmployee> {
    return (
      connection.models.Employee ||
      connection.model<IEmployee>('Employee', Employee.schema)
    );
  }
  private getTaskModel(connection: Connection): Model<ITask> {
    return (
      connection.models.Task || connection.model<ITask>('Task', Task.schema)
    );
  }
  private getDepartmentModel(connection: Connection): Model<IDepartment> {
    return (
      connection.models.Department ||
      connection.model<IDepartment>('Department', Department.schema)
    );
  }

  async createProject(
    connection: Connection,
    projectData: Partial<IProject>
  ): Promise<IProject> {
    const projectModel = this.getProjectModel(connection);
    const project = new projectModel(projectData);
    return project.save();
  }

  async getProjectsByManager(
    connection: Connection,
    query: any,
    skip: number,
    limit: number
  ): Promise<IProject[]> {
    const projectModel = this.getProjectModel(connection);
    const employeeModel = this.getEmployeeModel(connection);
    const DepartmentModel = this.getDepartmentModel(connection);
    return projectModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .populate('department')
      .populate('manager')
      .populate('employees')
      .exec();
  }

  async countProjects(connection: Connection, query: any): Promise<number> {
    const projectModel = this.getProjectModel(connection);
    return projectModel.countDocuments(query);
  }

  async getProjectById(
    connection: Connection,
    projectId: string
  ): Promise<IProject | null> {
    const projectModel = this.getProjectModel(connection);
    const employeeModel = this.getEmployeeModel(connection);
    const taskModel = this.getTaskModel(connection);
    const DepartmentModel = this.getDepartmentModel(connection);
    return projectModel
      .findById(projectId)
      .populate('department')
      .populate('manager')
      .populate('employees')
      .exec();
  }

  async createTask(
    connection: Connection,
    taskData: Partial<ITask>
  ): Promise<ITask | null> {
    const taskModel = this.getTaskModel(connection);
    const projectModel = this.getProjectModel(connection);
    const employeeModel = this.getEmployeeModel(connection);

    const task = new taskModel(taskData);
    console.log('task', task);
    const savedTask = await task.save();
    console.log('savedTask', savedTask);

    await projectModel.findByIdAndUpdate(
      savedTask.project,
      {
        $addToSet: { employees: savedTask.assignee },
      },
      { new: true }
    );

    const tasks = await taskModel
      .findById(savedTask._id)
      .populate('assignee', 'name email')
      .exec();
    return tasks;
  }

  async update(
    id: string,
    updateData: IProject,
    connection: Connection
  ): Promise<IProject | null> {
    const projectModel = this.getProjectModel(connection);
    return await projectModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }
  async updateStatus(
    id: string,
    status: string,
    connection: Connection
  ): Promise<IProject | null> {
    const projectModel = this.getProjectModel(connection);
    return await projectModel.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    );
  }

  async getTasksByEmployee(
    connection: Connection,
    employeeId: string,
    search: string,
    status: string,
    skip: number,
    limit: number
  ): Promise<ITask[]> {
    const taskModel = this.getTaskModel(connection);
    const employeeModel = this.getEmployeeModel(connection);
    const projectModel = this.getProjectModel(connection);
    const query: any = { assignee: employeeId };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    return taskModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .populate('assignee', 'name email')
      .populate('project')
      .exec();
  }

  async countTasksByEmployee(
    connection: Connection,
    employeeId: string,
    search: string,
    status: string
  ): Promise<number> {
    const taskModel = this.getTaskModel(connection);
    const query: any = { assignee: employeeId };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    return taskModel.countDocuments(query);
  }

  async updateTaskStatus(
    connection: Connection,
    taskId: string,
    status: string
  ): Promise<ITask | null> {
    const taskModel = this.getTaskModel(connection);
    return taskModel
      .findByIdAndUpdate(taskId, { status }, { new: true, runValidators: true })
      .exec();
  }

  async getAllProjects(
    connection: Connection,
    query: any,
    skip: number,
    limit: number
  ): Promise<IProject[]> {
    const projectModel = this.getProjectModel(connection);

    return projectModel
      .aggregate([
        { $match: query },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'tasks',
            localField: '_id',
            foreignField: 'project',
            as: 'tasks',
          },
        },
        {
          $addFields: {
            totalTasks: { $size: '$tasks' },
            completedTasks: {
              $size: {
                $filter: {
                  input: '$tasks',
                  as: 'task',
                  cond: { $eq: ['$$task.status', 'Completed'] },
                },
              },
            },
          },
        },

        {
          $lookup: {
            from: 'departments',
            localField: 'department',
            foreignField: '_id',
            as: 'department',
          },
        },
        { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },

        {
          $lookup: {
            from: 'employees',
            localField: 'manager',
            foreignField: '_id',
            as: 'manager',
          },
        },
        { $unwind: { path: '$manager', preserveNullAndEmptyArrays: true } },

        {
          $lookup: {
            from: 'employees',
            localField: 'employees',
            foreignField: '_id',
            as: 'employees',
          },
        },
      ])
      .exec();
  }

  async countAllProjects(connection: Connection, query: any): Promise<number> {
    const projectModel = this.getProjectModel(connection);
    return projectModel.countDocuments(query);
  }

  async updateProjectTask(
    connection: Connection,
    projectId: string,
    taskId: string,
    taskData: Partial<ITask>
  ): Promise<ITask | null> {
    const taskModel = this.getTaskModel(connection);
    const projectModel = this.getProjectModel(connection);

    const updatedTask = await taskModel
      .findOneAndUpdate(
        { _id: taskId, project: projectId },
        { $set: taskData },
        { new: true, runValidators: true }
      )
      .populate('assignee', 'name email')
      .populate('project', 'name')
      .exec();

    if (!updatedTask) {
      throw new Error('Task not found');
    }

    if (taskData.assignee) {
      await projectModel.findByIdAndUpdate(projectId, {
        $addToSet: { employees: taskData.assignee },
      });
    }

    return updatedTask;
  }

  async getTasksByProjectId(
    connection: Connection,
    projectId: string
  ): Promise<ITask[]> {
    const taskModel = this.getTaskModel(connection);
    const projectModel = this.getProjectModel(connection);
    const employeeModel = this.getEmployeeModel(connection);
    return taskModel
      .find({ project: projectId })
      .populate('assignee', 'name email')
      .populate('project', 'name')
      .exec();
  }
}
