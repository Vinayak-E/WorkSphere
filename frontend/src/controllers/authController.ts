import { FirebaseError } from "firebase/app";
import {
  auth,
  googleProvider,
  signInWithPopup,
} from "../config/firebase.config";
import api from "../api/axios";
import { signup } from "../services/authService";
import { toast } from "react-toastify";
import { FormState } from "@/types/types";

export const handleSignup = async (
  formState: FormState,
  navigate: any,
  setErrorMessage: any,
  setIsSubmitting: any,
) => {
  setIsSubmitting(true);
  try {
    const response = await signup({
      companyName: formState.companyName.value,
      email: formState.email.value,
      phone: formState.phone.value,
      industry: formState.industry.value,
      businessRegNo: formState.businessRegNo.value,
      city: formState.city.value,
      state: formState.state.value,
      country: formState.country.value,
      zipcode: formState.zipcode.value,
      password: formState.password.value,
    });

    if (response.registeredMail) {
      navigate(`/verifyOtp?email=${response.registeredMail}`);
      return response;
    }
  } catch (error) {
    setErrorMessage(
      error instanceof Error ? error.message : "Registration failed",
    );
    throw error;
  } finally {
    setIsSubmitting(false);
  }
};

export const authController = {
  async handleGoogleLogin() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const response = await api.post("/auth/google-login", { idToken });
      toast.success("Successfully logged in with Google!");
      return response.data;
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.error("Firebase error during Google login:", error.message);
        toast.error(error.message || "Google login failed");
      } else {
        console.error("Unexpected error during Google login:", error);
        toast.error("Google login failed. Please try again later.");
      }
      throw error;
    }
  },
};
