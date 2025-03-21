import api from '@/api/axios';
import {
  ICreateProject,
  IProject,
  ITask,
  ProjectQueryParams,
} from '@/types/IProject';

import toast from 'react-hot-toast';

export class ProjectService {
  static async createProject(projectData: ICreateProject) {
    const response = await api.post('/employee/projects', projectData, {
      withCredentials: true,
    });
    return response.data.data;
  } //ok

  static async getProjects(params?: ProjectQueryParams) {
    const response = await api.get('/employee/projects', {
      params,
      withCredentials: true,
    });
    console.log(response.data);
    return response.data;
  } //ok

  static async getAllProjects(params?: ProjectQueryParams) {
    const response = await api.get('/company/projects', {
      params,
      withCredentials: true,
    });
    console.log(response.data);
    return response.data;
  }

  static async updateProject(projectId: string, updateData: Partial<IProject>) {
    const response = await api.patch(
      `/employee/projects/${projectId}`,
      updateData
    );
    return response.data.data;
  } //ok

  static async updateProjectTask(
    projectId: string,
    taskId: string,
    taskData: any
  ) {
    const response = await api.put(
      `/employee/projects/${projectId}/tasks/${taskId}`,
      taskData
    );
    toast.success('Task updated successfully');
    return response.data.data;
  } //ok

  static async getProjectById(id: string) {
    const response = await api.get(`/employee/projects/${id}`);
    return response.data;
  } //ok

  static async createProjectTask(
    projectId: string,
    task: ITask
  ): Promise<ITask> {
    const response = await api.post(
      `/employee/projects/${projectId}/tasks`,
      task
    );
    return response.data.data;
  } //ok

  static async updateProjectStatus(projectId: string, status: string) {
    try {
      const response = await api.patch(
        `/employee/projects/${projectId}/status`,
        { status }
      );
      toast.success('Project status updated successfully');
      return response.data.data;
    } catch (error) {
      throw new Error('Failed to update project status');
    }
  }
}
