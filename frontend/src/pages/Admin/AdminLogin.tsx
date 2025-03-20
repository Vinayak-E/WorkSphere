import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import IMAGES from '../../assets/images/image';
import { AuthService } from '@/services/auth.service';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateInputs = () => {
    const inputPassword = password.trim();
    const inputEmail = email.trim();

    setPasswordMessage('');
    setEmailMessage('');
    setErrorMessage('');

    let isValid = true;

    if (!inputPassword) {
      setPasswordMessage('Please enter the password');
      isValid = false;
    } else if (inputPassword.length < 8) {
      setPasswordMessage('Minimum 8 characters');
      isValid = false;
    }

    if (!inputEmail) {
      setEmailMessage('Email is required');
      isValid = false;
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(inputEmail)
    ) {
      setEmailMessage('Please enter a valid email address');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInputs()) return;

    setIsSubmitting(true);

    try {
      await AuthService.adminLogin(email.trim(), password.trim());
      toast.success('Login successful');
      navigate('/admin/dashboard');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center">
      <div className="absolute top-8 left-8">
        <img
          src={IMAGES.navBarLogoDark}
          alt="WorkSphere Logo"
          className="w-32 h-auto"
        />
      </div>

      <div className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full transition-all duration-300 hover:shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={`w-full p-3 rounded-lg border ${
                emailMessage ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all`}
            />
            {emailMessage && (
              <p className="text-sm text-red-500 mt-1">{emailMessage}</p>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`w-full p-3 rounded-lg border ${
                  passwordMessage ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all`}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            {passwordMessage && (
              <p className="text-sm text-red-500 mt-1">{passwordMessage}</p>
            )}
          </div>

          {errorMessage && (
            <div className="py-2 px-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/85 transition-colors flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
