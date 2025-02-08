
import { ProjectService } from '@/services/employee/project.service';
import { toast } from 'react-hot-toast';
import { TaskFormData, projectSchema, taskSchema } from '@/utils/validations';
import { ICreateProject , IProject, ProjectQueryParams } from '@/types/IProject';

export class ProjectController {
  
  static async getProjects(params?: ProjectQueryParams) {
    try {
      return await ProjectService.getProjects(params);
    } catch (error: any) {
      this.handleError(error, 'fetch projects');
      throw error;
    }
  } //ok

  static async getAllProjects(params?: ProjectQueryParams) {
    try {
      return await ProjectService.getAllProjects(params);
    } catch (error: any) {
      this.handleError(error, 'fetch projects');
      throw error;
    }
  }

  static async createProject(projectData: ICreateProject, employeeId: string ) {
    try {
      const completeProjectData = { ...projectData, employeeId }
      const validationResult = projectSchema.safeParse(completeProjectData);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(error => ({
          path: error.path.join('.'),
          message: error.message
        }));
        throw new Error(JSON.stringify(errors));
      }
      const newProject = await ProjectService.createProject(completeProjectData);
      toast.success('Project created successfully');
      return newProject;
    } catch (error) {
      this.handleError(error, 'create project');
      throw error;
    }
  }//ok



  private static handleError(error: unknown, action: string) {
    if (error instanceof Error) {
      try {
        const errors = JSON.parse(error.message);
        toast.error(errors[0]?.message || `Failed to ${action}`);
      } catch {
        toast.error(error.message || `Failed to ${action}`);
      }
    }
  }
  static async updateProject(projectId: string, updateData: Partial<IProject>) {
    try {
      const completeProjectData = { ...updateData }
      const validationResult = projectSchema.safeParse(completeProjectData);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(error => ({
          path: error.path.join('.'),
          message: error.message
        }));
        throw new Error(JSON.stringify(errors));
      }
      const updatedProject = await ProjectService.updateProject(projectId, completeProjectData);
      toast.success('Project updated successfully');
      return updatedProject 
    } catch (error) {
      this.handleError(error, 'update project');
      throw error;
    }
  }//ok




  static async createTask(projectId: string, taskData: TaskFormData) {
    try {
      const validationResult = taskSchema.safeParse(taskData);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(error => ({
          path: error.path.join('.'),
          message: error.message
        }));
        throw new Error(JSON.stringify(errors));
      }
      
      const newTask = await ProjectService.createProjectTask(projectId, taskData);
      toast.success('Task created successfully');
      return newTask;
    } catch (error) {
      this.handleError(error, 'create task');
      throw error;
    }
  }


  static async updateTask(projectId: string, taskId: string, taskData: TaskFormData) {
    try {
      const validationResult = taskSchema.safeParse(taskData);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(error => ({
          path: error.path.join('.'),
          message: error.message
        }));
        throw new Error(JSON.stringify(errors));
      }
      
      const updatedTask = await ProjectService.updateProjectTask(projectId, taskId, taskData);
      toast.success('Task updated successfully');
      return updatedTask;
    } catch (error) {
      this.handleError(error, 'update task');
      throw error;
    }
  }

}