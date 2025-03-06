import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { TaskService } from '../../services/Implementation/task.service';
import { ITaskController } from '../Interface/ITaskController';


@injectable()
export class TaskController implements ITaskController{
  constructor(@inject('TaskService') private taskService: TaskService) {}

  getTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res.status(500).json({ success: false, message: 'Tenant connection not established' });
        return;
      }
      const { page = 1, limit = 10, projectId, employeeId, status } = req.query;
      const query: any = {};
      if (projectId) query.project = projectId;
      if (employeeId) query.assignee = employeeId;
      if (status) query.status = status;

      const { tasks, total } = await this.taskService.getTasks(tenantConnection, query, parseInt(page as string), parseInt(limit as string));
      res.status(200).json({
        success: true,
        data: tasks,
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
      });
    } catch (error) {
      next(error);
    }
  };

  getEmployeeTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      const { employeeId, page = '1', limit = '10', search = '', status = '' } = req.query;

      if (!tenantConnection || !employeeId) {
        res.status(400).json({ success: false, message: 'Missing required parameters' });
        return;
      }

      const options = {
        employeeId: employeeId as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        status: status as string,
      };

      const result = await this.taskService.getEmployeeTasks(tenantConnection, options);
      console.log('tasks',result)
      res.status(200).json({
        success: true,
        data: result.data,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
      });
    } catch (error) {
      next(error);
    }
  };

  createTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res.status(500).json({ success: false, message: 'Tenant connection not established' });
        return;
      }
      const projectId = req.params.id;
      const taskData = { ...req.body, project: projectId };
      const newTask = await this.taskService.createTask(tenantConnection, taskData);

      res.status(201).json({ success: true, data: newTask });
    } catch (error) {
      next(error);
    }
  };

  getTaskById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res.status(500).json({ success: false, message: 'Tenant connection not established' });
        return;
      }
      const taskId = req.params.id;
      const task = await this.taskService.getTaskById(tenantConnection, taskId);

      if (!task) {
        res.status(404).json({ success: false, message: 'Task not found' });
        return;
      }
      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  };

  updateTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res.status(500).json({ success: false, message: 'Tenant connection not established' });
        return;
      }
      const taskId = req.params.taskId; 
      const taskData = req.body;
      const updatedTask = await this.taskService.updateTask(tenantConnection, taskId, taskData);

      if (!updatedTask) {
        res.status(404).json({ success: false, message: 'Task not found' });
        return;
      }
      res.status(200).json({ success: true, data: updatedTask });
    } catch (error) {
      next(error);
    }
  };

  updateTaskStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res.status(500).json({ success: false, message: 'Tenant connection not established' });
        return;
      }
      const taskId = req.params.id;
      const { status } = req.body;

      const updatedTask = await this.taskService.updateTaskStatus(tenantConnection, taskId, status);
      if (!updatedTask) {
        res.status(404).json({ success: false, message: 'Task not found' });
        return;
      }
      res.status(200).json({ success: true, data: updatedTask });
    } catch (error) {
      next(error);
    }
  };

  deleteTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res.status(500).json({ success: false, message: 'Tenant connection not established' });
        return;
      }
      const taskId = req.params.id;
      const deleted = await this.taskService.deleteTask(tenantConnection, taskId);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Task not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}