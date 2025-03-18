import { injectable, inject } from 'tsyringe';
import { Messages } from '../../constants/messages';
import { HttpStatus } from '../../constants/httpStatus';
import { Request, Response, NextFunction } from 'express';
import { IProjectController } from '../Interface/IProjectController';
import { ProjectService } from '../../services/Implementation/project.service';
import { GetCompanyProjectsOptions } from '../../interfaces/company/IProject.types';

@injectable()
export class ProjectController implements IProjectController {
  constructor(
    @inject('ProjectService') private projectService: ProjectService
  ) {}

  getProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      const { page = 1, limit = 6, search = '', employeeId } = req.query;

      if (!tenantConnection || !employeeId) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: Messages.MISSING_FIELDS });
        return;
      }

      const options = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        employeeId: employeeId as string,
      };

      const result = await this.projectService.getManagerProjects(
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

  createProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: Messages.TENANT_CONNECTION_ERROR });
        return;
      }
      const { employeeId } = req.body;

      const projectData = { ...req.body, manager: employeeId };
      const newProject = await this.projectService.createProject(
        tenantConnection,
        projectData
      );

      res.status(HttpStatus.CREATED).json({ success: true, data: newProject });
    } catch (error) {
      next(error);
    }
  };

  getProjectById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: Messages.TENANT_CONNECTION_ERROR });
        return;
      }
      const projectId = req.params.id;
      const project = await this.projectService.getProjectById(
        tenantConnection,
        projectId
      );
      if (!project) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: Messages.PROJECT_NOT_FOUND });
        return;
      }
      res.status(HttpStatus.OK).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  };

  updateProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: Messages.TENANT_CONNECTION_ERROR });
        return;
      }
      const projectId = req.params.projectId;
      const projectData = req.body;
      const updatedProject = await this.projectService.updateProject(
        tenantConnection,
        projectId,
        projectData
      );

      if (!updatedProject) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: Messages.PROJECT_NOT_FOUND });
        return;
      }
      res.status(HttpStatus.OK).json({ success: true, data: updatedProject });
    } catch (error) {
      next(error);
    }
  };

  updateProjectStatus = async (
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
      const projectId = req.params.id;
      const { status } = req.body;

      const updatedProject = await this.projectService.updateProjectStatus(
        tenantConnection,
        projectId,
        status
      );
      if (!updatedProject) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: Messages.PROJECT_NOT_FOUND });
        return;
      }
      res.status(HttpStatus.OK).json({ success: true, data: updatedProject });
    } catch (error) {
      next(error);
    }
  };

  deleteProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: Messages.TENANT_CONNECTION_ERROR });
        return;
      }
      const projectId = req.params.id;
      const deleted = await this.projectService.deleteProject(
        tenantConnection,
        projectId
      );

      if (!deleted) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: Messages.PROJECT_NOT_FOUND });
        return;
      }
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  getAllProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: Messages.TENANT_CONNECTION_ERROR });
        return;
      }
      const {
        page = '1',
        limit = '6',
        search = '',
        status = 'all',
        department = 'all',
      } = req.query;

      const options: GetCompanyProjectsOptions = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        status: status !== 'all' ? (status as string) : undefined,
        department: department !== 'all' ? (department as string) : undefined,
      };

      const result = await this.projectService.getAllProjects(
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
}
