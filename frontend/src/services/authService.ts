import api from "../api/axios";
import {SignupData } from "@/types/types";
import { AxiosError } from "axios";
import { toast } from 'react-toastify';

export const signup = async (data: SignupData) => {
  try {
    const response = await api.post("/auth/signup", data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage = error.response?.data?.message || "Registration failed";
      throw new Error(errorMessage);
    }
    throw new Error("An unexpected error occurred during registration");
  }
};

export const resendOtpService = async (email: string) => {
  try {
    const response = await api.post(`/auth/resendOtp`, { email });
    toast.success('OTP has been resent successfully!');
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
    toast.error('An unexpected error occurred');
    throw new Error('An unexpected error occurred');
  }
};

export const verifyOtpService = async (email: string, otp: string) => {
  try {
    const response = await api.post('/auth/verifyOtp', { email, otp });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage = error.response?.data?.message || 'Invalid OTP';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
    toast.error('An unexpected error occurred');
    throw new Error('An unexpected error occurred');
  }
};