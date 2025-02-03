import api from '@/api/axios';
import { ICreateProject, IProject, ITask, ProjectQueryParams } from '@/types/IProject';


export class ProjectService {
  static async createProject(projectData: ICreateProject) {
   

    const response = await api.post('/employee/projects', projectData, {
      withCredentials: true,
    });
    return response.data.data;
  }

  static async getProjects(params?: ProjectQueryParams) {
    const response = await api.get('/employee/projects', {
      params,
      withCredentials: true,
    });
    return response.data;
  }

  static async updateProject(projectId: string, projectData: Partial<IProject>) {
    const response = await api.patch(`/projects/${projectId}`, projectData, {
      withCredentials: true,
    });
    return response.data.data;
  }

  static async deleteProject(projectId: string) {
    await api.delete(`/projects/${projectId}`, {
      withCredentials: true,
    });
  }

  static async getProjectById(id: string): Promise<IProject> {
   
    const response = await api.get(`/employee/projects/${id}`);
    console.log('reso',response)
    return response.data.data;
  }
  
  static async createProjectTask(projectId: string, task: ITask): Promise<ITask> {
    const response = await api.post(`/api/projects/${projectId}/tasks`, task);
    return response.data;
  }
}