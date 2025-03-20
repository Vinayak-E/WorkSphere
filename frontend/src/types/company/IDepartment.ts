export interface Department {
  _id: string;
  departmentId: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
}
export interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string>;
}
export interface FormErrors {
  name?: string | null;
  description?: string | null;
  status?: string | null;
}
export interface FormData {
  name: string;
  description: string;
  status: string;
}
