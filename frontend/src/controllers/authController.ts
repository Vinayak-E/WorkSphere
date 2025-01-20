import { FirebaseError } from 'firebase/app';
import { auth, googleProvider, signInWithPopup } from '../config/firebase.config';
import api from '../api/axios';
import { signup } from "../services/authService";


export const handleSignup = async (
  formState: any,
  navigate: any,
  setErrorMessage: any,
  setIsSubmitting:any
) => {
  setIsSubmitting(true);
  try {
    const response = await signup({
      companyName: formState.companyName.value,
      email: formState.email.value,
      phone: formState.phone.value,
      password: formState.password.value,
    });

    if (response.registeredMail) {
      navigate(`/verifyOtp?email=${response.registeredMail}`);
    }
  } catch (error) {
    setErrorMessage(error);
  } finally {
    setIsSubmitting(false);
  }
};


export const authController = {
    async handleGoogleLogin() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();
                console.log("result " ,result, "id",idToken);
                
            const response = await api.post('/auth/google-login', { idToken });
            return response.data;
        } catch (error) {
    
            if (error instanceof FirebaseError) {
                console.error('Firebase error during Google login:', error.message);
            } else {
                console.error('Unexpected error during Google login:', error);
            }
            throw new Error('Google login failed. Please try again later.');
        }
    },
};

