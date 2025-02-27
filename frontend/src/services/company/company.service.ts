import { CompanyProfileFormData } from "../../utils/companyValidations";
import api from "@/api/axios";
import { Icompany } from "@/types/types";

export class CompanyService {
  static async getCompanyProfile(): Promise<Icompany> {
    const response = await api.get<{ data: Icompany }>("/company/profile", {
      withCredentials: true,
    });
    return response.data.data;
  }

  static async updateCompanyProfile(
    formData: CompanyProfileFormData,
    companyId: string,
  ) {
    const updatedData = {
      companyName: formData.companyName,
      email: formData.email,
      phone: formData.phone,
      industry: formData.industry,
      businessRegNo: formData.businessRegNo,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      zipcode: formData.zipcode,
    };

    const response = await api.patch(
      `/company/updateProfile/${companyId}`,
      updatedData,
      {
        withCredentials: true,
      },
    );

    return response.data.data;
  }
}
