import { ProfileFormData } from '../../utils/validations'
import api from '@/api/axios';
import { IEmployee } from '@/types/IEmployee';
import { uploadToCloudinary } from '@/utils/cloudinary';
import toast from 'react-hot-toast';

export class ProfileService {

  static async getProfile(): Promise<IEmployee> {
    const response = await api.get<{ data: IEmployee }>("/employee/myProfile", {
      withCredentials: true,
    });
  
    return response.data.data;
  }


  static async updateProfile(formData: ProfileFormData , employeeId :string) {
    let imageUrl = formData.profilePicture;

    if (formData.profilePicture instanceof File) {
      imageUrl = await uploadToCloudinary(formData.profilePicture);
    }

    const updatedData = {
      ...formData,
      profilePicture: imageUrl
    };

    const response = await api.patch(`/employee/updateProfile/${employeeId}`, updatedData, {
      withCredentials: true,
    });

    return response.data.data;
  }

  static async getEmployeeTasks({
    employeeId,
    page,
    limit,
    search,
    status
  }: {
    employeeId: string;
    page: number;
    limit: number;
    search?: string;
    status?: string;
  }) {
    const response = await api.get(`/employee/tasks`, {
      params: { employeeId, page, limit, search, status }
    });
    return response.data;
  }
  
  static async updateTaskStatus(taskId: string, status: string) {
    const response = await api.patch(`/employee/tasks/${taskId}/status`, { status });
    toast.success('status updated successfully');
    return response.data.data;
  }
}