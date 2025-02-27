import { ProfileService } from "../../services/employee/employee.service";
import { profileSchema, ProfileFormData } from "../../utils/validations";
import { toast } from "react-toastify";

export class ProfileController {
  static async getProfile() {
    try {
      const profile = await ProfileService.getProfile();
      return profile;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch profile");
      throw error;
    }
  }
  static async handleProfileUpdate(
    formData: ProfileFormData,
    employeeId: string,
  ) {
    try {
      const validationResult = profileSchema.safeParse(formData);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map((error) => ({
          path: error.path.join("."),
          message: error.message,
        }));
        throw new Error(JSON.stringify(errors));
      }
      const updatedProfile = await ProfileService.updateProfile(
        formData,
        employeeId,
      );
      toast.success("Profile updated successfully");
      return updatedProfile;
    } catch (error) {
      if (error instanceof Error) {
        try {
          const errors = JSON.parse(error.message);
          toast.error(errors[0]?.message || "Failed to update profile");
        } catch {
          toast.error(error.message || "Failed to update profile");
        }
      }
      throw error;
    }
  }
}
