import { CompanyProfileFormData } from '../utils/companyValidations';
import api from '@/api/axios';
import { Icompany } from '@/types/types';

export class CompanyService {
  static async getCompanyProfile(): Promise<Icompany> {
    const response = await api.get<{ data: Icompany }>('/company/profile', {
      withCredentials: true,
    });
    return response.data.data;
  }

  static async updateCompanyProfile(
    formData: CompanyProfileFormData,
    companyId: string
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
      }
    );

    return response.data.data;
  }

  static async getDashboardData() {
    const response = await api.get('/company/dashboard', {
      withCredentials: true,
    });
    return response.data.data;
  }

  static async getDepartments() {
    const response = await api.get('/company/departments', {
      withCredentials: true,
    });
    return response.data.data || [];
  }

  static async createDepartment(departmentData: {
    name: string;
    description: string;
    status: string;
  }) {
    const response = await api.post('/company/departments', departmentData, {
      withCredentials: true,
    });
    return response.data.data;
  }

  static async updateDepartment(
    departmentId: string,
    departmentData: {
      name: string;
      description: string;
      status: string;
    }
  ) {
    const response = await api.put(
      `/company/departments/${departmentId}`,
      departmentData,
      { withCredentials: true }
    );
    return response.data.data;
  }

  static async getEmployees() {
    const response = await api.get('/company/employees', {
      withCredentials: true,
    });
    return response.data.data || [];
  }
  static async createEmployee(employeeData: any) {
    const response = await api.post('/company/employees', employeeData, {
      withCredentials: true,
    });
    return response.data.data;
  }

  static async updateEmployee(employeeId: string, employeeData: any) {
    const response = await api.put(
      `/company/employees/${employeeId}`,
      employeeData,
      { withCredentials: true }
    );
    return response.data.data;
  }

  static async getLeaves(page: number, limit: number, startDate: string, endDate: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      startDate: startDate,
      endDate: endDate,
    });
    const response = await api.get(`/company/leaves?${queryParams}`, {
      withCredentials: true,
    });
    return response.data;
  }
  
  static async updateLeaveStatus(leaveId: string, status: string) {
    const response = await api.patch(`/company/leaves/${leaveId}`, { status }, {
      withCredentials: true,
    });
    return response.data;
  }
  static async getAttendance(page: number, limit: number, date: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      date: date,
    });
    const response = await api.get(`/company/attendance?${queryParams}`, {
      withCredentials: true,
    });
    return response.data;
  }
  static async verifyPayment(sessionId: string) {
    const response = await api.get(
      `/company/checkout/payment-success?session_id=${sessionId}`,
      { withCredentials: true }
    );
    return response.data.data;
  }


  static async getCurrentPlan(user: any) {
    try {
      const response = await api.get('/company/current-plan', {
        withCredentials: true,
      });
      if (response.data.data) {
        return { ...response.data.data, isFreePlan: false };
      } else {
        return {
          isFreePlan: true,
          plan: {
            planName: 'Free Plan',
            description: 'Basic features for getting started',
            features: ['Limited access', 'Basic support'],
          },
          payment: {
            status: user?.userData?.subscriptionStatus || 'Active',
            amount: 0,
          },
          endDate: user?.userData?.subscriptionEndDate,
        };
      }
    } catch (error: any) {
      console.error('Error fetching current plan:', error);
      throw new Error(error.message || 'Failed to fetch current plan');
    }
  }


  static async getPaymentHistory(currentPage: number) {
    try {
      const response = await api.get(
        `/company/payment-history?page=${currentPage}&limit=10`,
        { withCredentials: true }
      );
      return {
        payments: response.data.data.payments || [],
        totalPages: response.data.data.totalPages || 1,
      };
    } catch (error: any) {
      console.error('Error fetching payment history:', error);
      throw new Error(error.message || 'Failed to fetch payment history');
    }
  }

}
