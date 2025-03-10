import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetCompanyProjectsOptions } from '../../interfaces/company/IProject.types';
import { ProjectService } from '../../services/Implementation/project.service';
import { IProjectController } from '../Interface/IProjectController';


@injectable()
export class ProjectController implements IProjectController {
  constructor(@inject('ProjectService') private projectService: ProjectService) {}

  getProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      const { page = 1, limit = 6, search = '', employeeId } = req.query;

      if (!tenantConnection || !employeeId) {
        res.status(400).json({ success: false, message: 'Missing required parameters' });
        return;
      }

      const options = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        employeeId: employeeId as string,
      };

      const result = await this.projectService.getManagerProjects(tenantConnection, options);

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

  createProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res.status(500).json({ success: false, message: 'Tenant connection not established' });
        return;
      }
      const { employeeId } = req.body;

      const projectData = { ...req.body, manager: employeeId };
      const newProject = await this.projectService.createProject(tenantConnection, projectData);

      res.status(201).json({ success: true, data: newProject });
    } catch (error) {
      next(error);
    }
  };

  getProjectById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res.status(500).json({ success: false, message: 'Tenant connection not established' });
        return;
      }
      const projectId = req.params.id;
      const project = await this.projectService.getProjectById(tenantConnection, projectId);
         console.log('project',project)
      if (!project) {
        res.status(404).json({ success: false, message: 'Project not found' });
        return;
      }
      console.log('project data',project)
      res.status(200).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  };

  updateProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res.status(500).json({ success: false, message: 'Tenant connection not established' });
        return;
      }
      const projectId = req.params.projectId;
      const projectData = req.body;
      const updatedProject = await this.projectService.updateProject(tenantConnection, projectId, projectData);

      if (!updatedProject) {
        res.status(404).json({ success: false, message: 'Project not found' });
        return;
      }
      res.status(200).json({ success: true, data: updatedProject });
    } catch (error) {
      next(error);
    }
  };

  updateProjectStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res.status(500).json({ success: false, message: 'Tenant connection not established' });
        return;
      }
      const projectId = req.params.id;
      const { status } = req.body;

      const updatedProject = await this.projectService.updateProjectStatus(tenantConnection, projectId, status);
      if (!updatedProject) {
        res.status(404).json({ success: false, message: 'Project not found' });
        return;
      }
      res.status(200).json({ success: true, data: updatedProject });
    } catch (error) {
      next(error);
    }
  };

  deleteProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res.status(500).json({ success: false, message: 'Tenant connection not established' });
        return;
      }
      const projectId = req.params.id;
      const deleted = await this.projectService.deleteProject(tenantConnection, projectId);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Project not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  getAllProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res.status(500).json({ success: false, message: 'Tenant connection not established' });
        return;
      }
      const { page = '1', limit = '6', search = '', status = 'all', department = 'all' } = req.query;

      const options: GetCompanyProjectsOptions = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        status: status !== 'all' ? (status as string) : undefined,
        department: department !== 'all' ? (department as string) : undefined,
      };

      const result = await this.projectService.getAllProjects(tenantConnection, options);

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
}