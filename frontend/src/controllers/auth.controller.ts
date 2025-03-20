import { AuthService } from "../services/auth.service";
import { AppDispatch } from "../redux/store"; 
import { setUser } from "../redux/slices/authSlice";
import { NavigateFunction } from "react-router-dom";
import toast from "react-hot-toast";
import { SignupData } from "@/types/types";

export class AuthController {
  static async login(
    email: string,
    password: string,
    userType: string,
    dispatch: AppDispatch,
    navigate: NavigateFunction
  ) {
    try {
      const response = await AuthService.login(email, password, userType);
      if (response.success) {
        const { email, tenantId, role, forcePasswordChange } = response;
        dispatch(setUser({ email, role, tenantId }));
        if (forcePasswordChange) {
          toast("Please change your default password before continuing");
          navigate("/passwordChange");
        } else {
          const roleRoutes = {
            ADMIN: "/admin",
            COMPANY: "/company",
            MANAGER: "/employee",
            EMPLOYEE: "/employee",
          } as const; 
          
          const route = roleRoutes[role as keyof typeof roleRoutes]; 
          navigate(route);
          
        }
      } else {
        throw new Error("Login failed. Please try again.");
      }
    } catch (error) {
      throw error; 
    }
  }

  static async handleSignup(
    signupData: SignupData,
    navigate: NavigateFunction
  ) {
    try {
      const response = await AuthService.signup(signupData);
      if (response.registeredMail) {
        navigate(`/verifyOtp?email=${response.registeredMail}`);
        return response;
      } else {
        throw new Error("Signup failed. No registered email returned.");
      }
    } catch (error) {
      throw error; 
    }
  }

  static async handleResendOtp(email: string) {
    try {
      await AuthService.resendOtp(email);
    } catch (error) {
      throw error;
    }
  }
  
  static async handleVerifyOtp(email: string, otp: string, navigate: NavigateFunction) {
    try {
      await AuthService.verifyOtp(email, otp);
      toast.success(
        "Your email has been successfully verified. Your account is pending administrative approval. You will receive an email once approved"
      );
      navigate("/login");
    } catch (error) {
      throw error;
    }
  }
}
