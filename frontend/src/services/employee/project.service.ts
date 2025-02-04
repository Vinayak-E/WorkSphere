import api from '@/api/axios';
import { ICreateProject, IProject, ITask, ProjectQueryParams, ProjectResponse } from '@/types/IProject';
import { AxiosResponse } from 'axios';


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
    console.log(response.data)
    return response.data;
  }

  static async updateProject(projectId: string, projectData: Partial<IProject>) {
    const response = await api.patch(`/projects/${projectId}`, projectData, {
      withCredentials: true,
    });
    return response.data.data;
  }

  static async getProjectById(id: string): Promise<ProjectResponse> {
    const response: AxiosResponse<ProjectResponse> = await api.get(`/employee/projects/${id}`);
    return response.data;  
  }
 
  
  static async createProjectTask(projectId: string, task: ITask): Promise<ITask> {
    const response = await api.post(`/employee/projects/${projectId}/tasks`, task);
    return response.data;
  }
}