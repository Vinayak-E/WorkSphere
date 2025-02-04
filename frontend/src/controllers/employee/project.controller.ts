
import { ProjectService } from '@/services/employee/project.service';
import { toast } from 'react-toastify';
import { projectSchema } from '@/utils/validations';
import { ICreateProject , ProjectQueryParams } from '@/types/IProject';

export class ProjectController {
  
  static async getProjects(params?: ProjectQueryParams) {
    try {
      return await ProjectService.getProjects(params);
    } catch (error: any) {
      this.handleError(error, 'fetch projects');
      throw error;
    }
  }

  static async createProject(projectData: ICreateProject, employeeId: string) {
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
  }



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



}