import { injectable, inject } from 'tsyringe';
import { Messages } from '../../constants/messages';
import { HttpStatus } from '../../constants/httpStatus';
import { Request, Response, NextFunction } from 'express';
import { ITaskController } from '../Interface/ITaskController';
import { TaskService } from '../../services/Implementation/task.service';

@injectable()
export class TaskController implements ITaskController {
  constructor(@inject('TaskService') private taskService: TaskService) {}

  getTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: Messages.TENANT_CONNECTION_ERROR });
        return;
      }
      const { page = 1, limit = 10, projectId, employeeId, status } = req.query;
      const query: any = {};
      if (projectId) query.project = projectId;
      if (employeeId) query.assignee = employeeId;
      if (status) query.status = status;

      const { tasks, total } = await this.taskService.getTasks(
        tenantConnection,
        query,
        parseInt(page as string),
        parseInt(limit as string)
      );
      res.status(HttpStatus.OK).json({
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

  getEmployeeTasks = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tenantConnection = req.tenantConnection;
      const {
        employeeId,
        page = '1',
        limit = '10',
        search = '',
        status = '',
      } = req.query;

      if (!tenantConnection || !employeeId) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: Messages.MISSING_FIELDS });
        return;
      }

      const options = {
        employeeId: employeeId as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        status: status as string,
      };

      const result = await this.taskService.getEmployeeTasks(
        tenantConnection,
        options
      );
      res.status(HttpStatus.OK).json({
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
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: Messages.TENANT_CONNECTION_ERROR });
        return;
      }
      const projectId = req.params.id;
      const taskData = { ...req.body, project: projectId };
      const newTask = await this.taskService.createTask(
        tenantConnection,
        taskData
      );

      res.status(HttpStatus.CREATED).json({ success: true, data: newTask });
    } catch (error) {
      next(error);
    }
  };

  getTaskById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: Messages.TENANT_CONNECTION_ERROR });
        return;
      }
      const taskId = req.params.id;
      const task = await this.taskService.getTaskById(tenantConnection, taskId);

      if (!task) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: Messages.TASK_NOT_FOUND });
        return;
      }
      res.status(HttpStatus.OK).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  };

  updateTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: Messages.TENANT_CONNECTION_ERROR });
        return;
      }
      const taskId = req.params.taskId;
      const taskData = req.body;
      const updatedTask = await this.taskService.updateTask(
        tenantConnection,
        taskId,
        taskData
      );

      if (!updatedTask) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: Messages.TASK_NOT_FOUND });
        return;
      }
      res.status(HttpStatus.OK).json({ success: true, data: updatedTask });
    } catch (error) {
      next(error);
    }
  };

  updateTaskStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: Messages.TENANT_CONNECTION_ERROR });
        return;
      }
      const taskId = req.params.id;
      const { status, comment } = req.body;
  
      const updatedTask = await this.taskService.updateTaskStatus(
        tenantConnection,
        taskId,
        status,
        comment || '' 
      );
      if (!updatedTask) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: Messages.TASK_NOT_FOUND });
        return;
      }
      res.status(HttpStatus.OK).json({ success: true, data: updatedTask });
    } catch (error) {
      next(error);
    }
  };

  deleteTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: Messages.TENANT_CONNECTION_ERROR });
        return;
      }
      const taskId = req.params.id;
      const deleted = await this.taskService.deleteTask(
        tenantConnection,
        taskId
      );

      if (!deleted) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: Messages.TASK_NOT_FOUND });
        return;
      }
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
}
