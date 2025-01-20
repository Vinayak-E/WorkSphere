import api from "../api/axios";
import {SignupData } from "@/types/types";
import { AxiosError } from "axios";

export const signup = async (data: SignupData) => {
  try {
    const response = await api.post("/auth/signup", data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "An error occurred.";
  }
};


export const resendOtpService = async (email: string) => {
  try {
    const response = await api.post(`/auth/resendOtp`, { email });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to resend OTP');
    }
    throw new Error('An unexpected error occurred');
  }
};

export const verifyOtpService = async (email: string, otp: string) => {
  try {
    const response = await api.post('/auth/verifyOtp', { email, otp });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred');
    }
    throw new Error('An unexpected error occurred');
  }
};
