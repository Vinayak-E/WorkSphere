import { useState, FormEvent } from 'react';
import IMAGES from '../assets/images/image';
import api from '../api/axios';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { setUser } from '../redux/slices/authSlice';
import { Link } from 'react-router-dom';

interface FieldState {
  value: string;
  error: string;
  touched: boolean;
  isValid: boolean;
}

type FieldName = 'email' | 'password';

interface FormState {
  email: FieldState;
  password: FieldState;
}

interface IRoleRoutes {
  ADMIN: string;
  EMPLOYEE: string;
  MANAGER: string;
  COMPANY: string;
}

const Login = () => {
  const [formState, setFormState] = useState<FormState>({
    email: { value: '', error: '', touched: false, isValid: false },
    password: { value: '', error: '', touched: false, isValid: false },
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [userType, setUserType] = useState('EMPLOYEE');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validateField = (
    name: FieldName,
    value: string,
    allValues: FormState
  ): FieldState => {
    let error = '';
    let isValid = true;

    switch (name) {
      case 'email':
        if (!value) {
          error = 'Email is required';
          isValid = false;
        } else if (
          !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
        ) {
          error = 'Please enter a valid email address';
          isValid = false;
        }
        break;

      case 'password':
        if (!value) {
          error = 'Password is required';
          isValid = false;
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
          isValid = false;
        }
        break;
    }

    return { value, error, touched: true, isValid };
  };

  const handleChange =
    (name: FieldName) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      setFormState(prev => ({
        ...prev,
        [name]: validateField(name, value, prev),
      }));
    };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validatedState = (
      Object.keys(formState) as FieldName[]
    ).reduce<FormState>(
      (acc, key) => ({
        ...acc,
        [key]: validateField(key, formState[key].value, formState),
      }),
      formState
    );

    setFormState(validatedState);

    const isValid = Object.values(validatedState).every(field => field.isValid);

    if (isValid) {
      setIsSubmitting(true);

      try {
        const response = await api.post('/auth/login', {
          email: formState.email.value,
          password: formState.password.value,
          userType,
        });

        if (response.status === 200 && response.data.success) {
          const { email, tenantId, role, forcePasswordChange } = response.data;

          dispatch(
            setUser({
              email,
              role,
              tenantId,
            })
          );

          if (forcePasswordChange) {
            toast.info('Please change your default password before continuing');
            navigate('/passwordChange');
            return;
          }

          const roleRoutes: IRoleRoutes = {
            ADMIN: '/admin',
            COMPANY: '/company',
            MANAGER: '/employee',
            EMPLOYEE: '/employee',
          };
          let url = roleRoutes[role as keyof typeof roleRoutes];
          navigate(url);
        } else {
          setErrorMessage('Login failed. Please try again.');
        }
      } catch (error: unknown) {
        console.error('Login Error:', error);
        if (error instanceof AxiosError) {
          setErrorMessage(
            error.response?.data?.message || 'An error occurred.'
          );
        } else {
          setErrorMessage('An unexpected error occurred.');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  const getInputStyle = (field: FieldState) => `
    w-full pb-2 border-b-2 
    ${field.touched && field.error ? 'border-red-500' : 'border-gray-300'}
    ${field.touched && !field.error ? 'border-green-500' : ''} focus:border-black outline-none`;

  return (
    <>
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
      <div className="min-h-screen bg-background p-3 md:p-6 lg:p-8 relative">
        <div className="top-0 left-0">
          <Link to="/">
            <img
              src={IMAGES.navBarLogoDark}
              alt="WorkSphere Logo"
              className="w-28 h-auto cursor-pointer"
            />
          </Link>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="text-[#2C3E50] space-y-10">
            <h1 className="text-4xl sm:text-5xl font-bold leading-snug mt-8 sm:mt-0">
              {userType === 'EMPLOYEE'
                ? 'Welcome Back to Your Workspace'
                : 'Streamline Your Company Management'}
            </h1>
            <p className="text-lg md:text-xl text-[#333333]">
              {userType === 'EMPLOYEE'
                ? 'Access your work environment securely and efficiently.'
                : 'Enhance operations and improve workforce management with WorkSphere.'}
            </p>

            <div className="grid grid-cols-3 gap-4 pt-8">
              <div>
                <h3 className="text-4xl font-bold">100+</h3>
                <p className="text-gray-900">Enterprises</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold">200k+</h3>
                <p className="text-gray-900">Happy Users</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold">15+</h3>
                <p className="text-gray-900">Countries</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-1 md:p-8 shadow-xl max-w-lg mx-auto w-full ">
            <h1 className="text-xl font-bold mb-6 text-center">
              {userType === 'EMPLOYEE' ? 'EMPLOYEE LOGIN' : 'COMPANY LOGIN'}
            </h1>
            <div className="flex justify-center mb-6">
              <div className="inline-flex  mb-6  rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => setUserType('EMPLOYEE')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    userType === 'EMPLOYEE'
                      ? 'bg-[#6C7A89] text-white'
                      : 'text-gray-500 hover:text-[#5B6770]'
                  }`}
                >
                  Employee Login
                </button>
                <button
                  onClick={() => setUserType('COMPANY')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    userType === 'COMPANY'
                      ? 'bg-[#6C7A89] text-white'
                      : 'text-gray-500 hover:text-[#5B6770]'
                  }`}
                >
                  Company Login
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="name@company.com"
                  value={formState.email.value}
                  onChange={handleChange('email')}
                  className={getInputStyle(formState.email)}
                />
                {formState.email.touched && formState.email.error && (
                  <p className="text-sm text-red-500 mt-1">
                    {formState.email.error}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={formState.password.value}
                  onChange={handleChange('password')}
                  className={getInputStyle(formState.password)}
                />
                {formState.password.touched && formState.password.error && (
                  <p className="text-sm text-red-500 mt-1">
                    {formState.password.error}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-gray-400 hover:text-gray-900 hover:underline"
              >
                Forgot password?
              </button>

              {errorMessage && (
                <p className="text-sm text-red-500">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary rounded-xl text-white py-3 px-6  hover:bg-[#3D7EBD] transition disabled:opacity-50 disabled:cursor-not-allowed "
              >
                {isSubmitting ? 'Loading...' : 'Login'}
              </button>

              {userType === 'COMPANY' && (
                  <p className="text-sm text-gray-500 text-center">
                    Don't have an account yet?{' '}
                    <Link
                      to="/register"
                      className="text-primary hover:text-blue-700 font-medium"
                    >
                      Create New Account
                    </Link>
                  </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
