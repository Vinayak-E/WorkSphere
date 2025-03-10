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
  industry: string;
  businessRegNo: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  password: string;
}

export type FieldName =
  | "companyName"
  | "email"
  | "phone"
  | "industry"
  | "businessRegNo"
  | "city"
  | "state"
  | "zipcode"
  | "country"
  | "password"
  | "confirmPassword";

export interface FormState {
  companyName: FieldState;
  email: FieldState;
  phone: FieldState;
  industry: FieldState;
  businessRegNo: FieldState;
  city: FieldState;
  state: FieldState;
  country: FieldState;
  zipcode: FieldState;
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
  industry: string;
  businessRegNo: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  password: string;
  confirmPassword: string;
}

export interface Icompany {
  companyName: string;
  email: string;
  password: string;
  phone: string | null;
  industry: string;
  businessRegNo: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
}
