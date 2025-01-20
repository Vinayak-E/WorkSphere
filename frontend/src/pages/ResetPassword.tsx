
import { useState, useEffect } from "react";
import IMAGES from "../assets/images/image";
import api from "../api/axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AxiosError } from "axios";
import { toast, ToastContainer } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface resetResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  message: string;
  isAdmin: boolean;
}

const ResetPassword: React.FC = () => {

  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmpassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [confirmPasswordMessage, setConfirmPasswordMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const togglePassword1Visibility = () => {
    setShowPassword1(!showPassword1);
  };

  const togglePassword2Visibility = () => {
    setShowPassword2(!showPassword2);
  };
  
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      setErrorMessage('Invalid or missing reset token');
    }
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const inputPassword = password.trim();
    const inputConfirmPassword = confirmPassword.trim();

    setPasswordMessage('');
    setConfirmPasswordMessage('');

    let isValid = true;

    if (!inputPassword) {
        setPasswordMessage('Please enter the password');
        isValid = false;
    } else if (inputPassword.length < 8) {
        setPasswordMessage('Minimum 8 characters');
        isValid = false;
    }

    if (!inputConfirmPassword) {
        setConfirmPasswordMessage('Please confirm the password');
        isValid = false;
    } else if (inputConfirmPassword !== inputPassword) {
        setErrorMessage('Passwords do not match!');
        isValid = false;
    }

    if (isValid) {

        try {
            const response = await api.post<resetResponse>('/auth/resetPassword', { 
                token, 
                newPassword: inputPassword, 
            });

            console.log('Response: ', response)

            if (response.status !== 200) {
                return setErrorMessage(response.data.message);
            }

            if (response.data) {
                toast.success('Password reset successfully!');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (error: unknown) {
          if (error instanceof AxiosError) {
            const errorMessage = error.response?.data?.message || 'An error occurred';
            setErrorMessage(errorMessage);
          } else {
            console.error('Login failed:', error);
            setErrorMessage('An unexpected error occurred');
          }
        }
    }
  }

  return (
    <div className="min-h-screen bg-[#E9E9E9] p-3 md:p-6 lg:p-8  relative">
        <ToastContainer 
        position="top-right" 
        autoClose={5000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
    />

      <div className="top-8 left-8">
        <img src={IMAGES.navBarLogoDark} alt="WorkSphere Logo" className="w-32 h-auto" />
      </div>

    
      

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl max-w-lg mx-auto w-full">
          <h1 className="text-xl font-bold mb-6">RESET PASSWORD</h1>
          <form onSubmit={handleResetPassword} className="space-y-6">
           
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type={showPassword1 ? "text" : "password"} 
                id="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pb-2 border-b-2 ${
                  passwordMessage ? "border-red-500" : "border-gray-300"
                } focus:border-black outline-none`}
              />
              {passwordMessage && <p className="text-sm text-red-500">{passwordMessage}</p>}
              <button
                        type="button"
                        onClick={togglePassword1Visibility}
                        className="absolute right-3 top-8 text-xl text-gray-600"
                    >
                        {showPassword1 ? <FaEyeSlash /> : <FaEye />}
                    </button>
            </div>

        
            <div className="relative">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
               type={showPassword2 ? "text" : "password"} 
                id="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmpassword(e.target.value)}
                className={`w-full pb-2 border-b-2 ${
                  confirmPasswordMessage ? "border-red-500" : "border-gray-300"
                } focus:border-black outline-none`}
              />
              {confirmPasswordMessage && (
                <p className="text-sm text-red-500">{confirmPasswordMessage}</p>
              )}
              <button type="button" onClick={togglePassword2Visibility} className="absolute right-3 top-8 text-xl text-gray-600">
                        {showPassword2 ? <FaEyeSlash /> : <FaEye />}
                    </button>
            </div>
            {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition"
            >
              {isSubmitting ? "Please wait..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
  
  );
};

export default ResetPassword;
