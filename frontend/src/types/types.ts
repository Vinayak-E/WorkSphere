export interface FieldState {
  value: string;
  error: string;
  touched: boolean;
  isValid: boolean;
}
export interface SignupData {
  companyName: string;
  email: string;
  phone: string;
  password: string;
}

export type FieldName = "companyName" | "email" | "phone" | "password" | "confirmPassword";

export interface FormState {
  companyName: FieldState;
  email: FieldState;
  phone: FieldState;
  password: FieldState;
  confirmPassword: FieldState;
} 

export interface RegisterResponse {
  success: boolean;
  message?: string;
  error?: string;
}


export interface ValidationRules {
  companyName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

