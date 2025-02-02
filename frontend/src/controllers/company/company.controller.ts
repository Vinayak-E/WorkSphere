import { CompanyService } from '../../services/company/company.service';
import { companyProfileSchema, CompanyProfileFormData } from '../../utils/companyValidations';
import { toast } from 'react-toastify';

export class CompanyController {
  static async getCompanyProfile() {
    try {
      const profile = await CompanyService.getCompanyProfile();
      return profile;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch company profile");
      throw error;
    }
  }

  static async handleProfileUpdate(formData: CompanyProfileFormData, companyId: string) {
    try {
      const validationResult = companyProfileSchema.safeParse(formData);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(error => ({
          path: error.path.join('.'),
          message: error.message
        }));
        throw new Error(JSON.stringify(errors));
      }
      const updatedProfile = await CompanyService.updateCompanyProfile(formData, companyId);
      toast.success("Company profile updated successfully");
      return updatedProfile;
    } catch (error) {
      if (error instanceof Error) {
        try {
          const errors = JSON.parse(error.message);
          toast.error(errors[0]?.message || "Failed to update company profile");
        } catch {
          toast.error(error.message || "Failed to update company profile");
        }
      }
      throw error;
    }
  }
}