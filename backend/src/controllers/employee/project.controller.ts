import { Request, Response, NextFunction, RequestHandler } from "express";
import { IProjectService } from "../../interfaces/company/IProject.types";

export class ProjectController {
  constructor(private readonly projectService: IProjectService ){}

  getProjects: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;

      if (!tenantConnection) {
          res.status(500).json({
              success: false,
              message: "Tenant connection not established"
          });
          return;
      }

  const employeeId = req.query.employeeId

  if (!employeeId ) {
    res.status(500).json({
        success: false,
        message: "Tenant connection not established"
    });
    return;
}
   const id = employeeId .toString()
   
      const projects = await this.projectService.getManagerProjects(tenantConnection,id);
      
      
      res.status(200).json({
        success: true,
        data: projects
      });
    } catch (error) {
      next(error);
    }
  };

  createProject: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
    
      const tenantConnection = req.tenantConnection;

      if (!tenantConnection) {
          res.status(500).json({
              success: false,
              message: "Tenant connection not established"
          });
          return;
      }
      const {employeeId} = req.body

      const projectData = {
        ...req.body,
        manager: employeeId
      };

      const newProject = await this.projectService.createProject(tenantConnection,projectData);
      
      res.status(201).json({
        success: true,
        data: newProject
      });
    } catch (error) {
      next(error);
    }
  };

  projectDetails: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantConnection = req.tenantConnection;
        if (!tenantConnection) {
            res.status(500).json({ success: false, message: "Tenant connection not established" });
            return;
        }

        const projectId = req.params.id;
        const { project, departmentEmployees } = await this.projectService.getProjectDetails(tenantConnection, projectId);
        
        res.status(200).json({ 
            success: true, 
            data: {
                project,
                departmentEmployees
            }
        });
    } catch (error) {
        next(error);
    }
}
addTask: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('hello');
    
    const tenantConnection = req.tenantConnection;
    if (!tenantConnection) {
      res.status(500).json({ success: false, message: "Tenant connection not established" });
      return;
    }
    const projectId = req.params.id;
    const taskData = { ...req.body, project: projectId };

    const newTask = await this.projectService.addTask(tenantConnection, taskData);
    res.status(201).json({ success: true, data: newTask });
  } catch (error) {
    next(error);
  }
};

}