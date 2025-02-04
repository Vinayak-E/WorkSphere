import { Request, Response, NextFunction, RequestHandler } from "express";
import { GetCompanyProjectsOptions, IProjectService } from "../../interfaces/company/IProject.types";

export class ProjectController {
  constructor(private readonly projectService: IProjectService ){}

  getProjects: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      const { 
        page = 1, 
        limit = 6, 
        search = '',
        employeeId 
      } = req.query;
  
      if (!tenantConnection || !employeeId) {
       res.status(400).json({
          success: false,
          message: "Missing required parameters"
        });
        return 
      }
  
      const options = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        employeeId: employeeId as string
      };
  
      const result = await this.projectService.getManagerProjects(tenantConnection, options);
      
      res.status(200).json({
        success: true,
        data: result.data,
        totalPages: result.totalPages,
        currentPage: result.currentPage
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
   
    
    const tenantConnection = req.tenantConnection;
    if (!tenantConnection) {
      res.status(500).json({ success: false, message: "Tenant connection not established" });
      return;
    }
    const projectId = req.params.id;
    const taskData = { ...req.body, project: projectId };

    const newTask = await this.projectService.addTask(tenantConnection, taskData);
    console.log('new Task',newTask)
    res.status(201).json({ success: true, data: newTask });
  } catch (error) {
    next(error);
  }
};


editProject: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
  
    const tenantConnection = req.tenantConnection;

    if (!tenantConnection) {
        res.status(500).json({
            success: false,
            message: "Tenant connection not established"
        });
        return;
    }
     const projectId = req.params.projectId
     const projectData = req.body
    const newProject = await this.projectService.updateProject(projectId,tenantConnection,projectData);
    
    res.status(201).json({
      success: true,
      data: newProject
    });
  } catch (error) {
    next(error);
  }
};


  updateProjectStatus: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
  
    const tenantConnection = req.tenantConnection;

    if (!tenantConnection) {
        res.status(500).json({
            success: false,
            message: "Tenant connection not established"
        });
        return;
    }
     const projectId = req.params.id
     const {status} = req.body
     console.log('rq body',req.body)
    const newProject = await this.projectService.updateProjectStatus(projectId,tenantConnection, status);
    
    res.status(201).json({
      success: true,
      data: newProject
    });
  } catch (error) {
    next(error);
  }
}

  getEmployeeTasks: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      const { employeeId, page = '1', limit = '10', search = '', status = '' } = req.query;
        console.log("req.queery",req.query)
      if (!tenantConnection || !employeeId) {
         res.status(400).json({
          success: false,
          message: "Missing required parameters"
        });
        return
      }

      const options = {
        employeeId: employeeId as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        status: status as string,
      };

      const result = await this.projectService.getEmployeeTasks(tenantConnection, options);
      res.status(200).json({
        success: true,
        data: result.data,
        totalPages: result.totalPages,
        currentPage: result.currentPage
      });
    } catch (error) {
      next(error);
    }
  };


  updateTaskStatus: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      const taskId = req.params.id;
      const { status } = req.body;

      if (!tenantConnection || !taskId || !status) {
           res.status(400).json({
          success: false,
          message: "Missing required parameters"
        });
        return 
      }

      const updatedTask = await this.projectService.updateTaskStatus(tenantConnection, taskId, status);
       res.status(200).json({
        success: true,
        data: updatedTask
      });
    } catch (error) {
      next(error);
    }
  };


  getAllProjects: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
         res.status(500).json({ success: false, message: "Tenant connection not established" });
         return
      }
      
      const { page = "1", limit = "6", search = "", status = "all", department = "all" } = req.query;

      const options: GetCompanyProjectsOptions = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        status: status !== "all" ? (status as string) : undefined,
        department: department !== "all" ? (department as string) : undefined,
      };

      const result = await this.projectService.getAllProjects(tenantConnection, options);

      res.status(200).json({
        success: true,
        data: result.data,
        totalPages: result.totalPages,
        currentPage: result.currentPage
      });
    } catch (error) {
      next(error);
    }
  };
}