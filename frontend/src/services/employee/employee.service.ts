import { ProfileFormData } from '../../utils/validations'
import api from '@/api/axios';
import { Employee } from '@/types/IEmployee';
import { uploadToCloudinary } from '@/utils/cloudinary';

export class ProfileService {

  static async getProfile(): Promise<Employee> {
    const response = await api.get<{ data: Employee }>("/employee/myProfile", {
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
}