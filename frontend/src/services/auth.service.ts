import api from "@/api/axios";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { SignupData } from "@/types/types";

export class AuthService {
  static async login(email: string, password: string, userType: string) {
    try {
      const response = await api.post("/auth/login", { email, password, userType }, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || "Login failed";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      toast.error("An unexpected error occurred during login");
      throw new Error("An unexpected error occurred during login");
    }
  }

  static async signup(data: SignupData) {
    try {
      const response = await api.post("/auth/signup", data, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || "Registration failed";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      toast.error("An unexpected error occurred during registration");
      throw new Error("An unexpected error occurred during registration");
    }
  }

  static async resendOtp(email: string) {
    try {
      const response = await api.post("/auth/resendOtp", { email }, {
        withCredentials: true,
      });
      toast.success("OTP has been resent successfully!");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || "Failed to resend OTP";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      toast.error("An unexpected error occurred");
      throw new Error("An unexpected error occurred");
    }
  }

  static async verifyOtp(email: string, otp: string) {
    try {
      const response = await api.post("/auth/verifyOtp", { email, otp }, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || "Invalid OTP";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      toast.error("An unexpected error occurred");
      throw new Error("An unexpected error occurred");
    }
  }


  static async forgotPassword(email: string) {
    try {
      const response = await api.post(
        "/auth/forgotPassword",
        { email },
        { withCredentials: true }
      );
      toast.success("Reset link has been sent to your email!");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.message || "Failed to send reset link";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      toast.error("An unexpected error occurred");
      throw new Error("An unexpected error occurred");
    }
  }
  static async resetPassword(token: string, newPassword: string) {
    try {
      const response = await api.post(
        "/auth/resetPassword",
        { token, newPassword },
        { withCredentials: true }
      );
      toast.success("Password reset successfully!");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || "Failed to reset password";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      toast.error("An unexpected error occurred");
      throw new Error("An unexpected error occurred");
    }
  }

  static async adminLogin(email: string, password: string) {
    try {
      const response = await api.post(
        "/admin/login",
        { email, password },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message ||  "Login failed";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      toast.error("An unexpected error occurred");
      throw new Error("An unexpected error occurred");
    }
  }
}