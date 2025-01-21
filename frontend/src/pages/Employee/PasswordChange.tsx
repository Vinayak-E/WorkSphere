import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';

interface FormState {
  newPassword: string;
  confirmPassword: string;
}

const PasswordChange: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formState.newPassword !== formState.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formState.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('userData',userData)
      console.log('hellooooo')
      const response = await api.post('/employee/changePassword', {
        email: userData.email,
        newPassword: formState.newPassword
      });

      if (response.status === 200) {
        toast.success('Password changed successfully!');

        const role = userData.role;
        switch (role) {
          case "ADMIN":
            navigate("/admin");
            break;
          case "COMPANY":
            navigate("/company");
            break;
          case "MANAGER":
            navigate("/manager");
            break;
          case "EMPLOYEE":
            navigate("/employee");
            break;
          default:
            navigate("/login");
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to change password');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Change Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please set a new password to continue
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="password"
                required
                placeholder="New Password"
                value={formState.newPassword}
                onChange={(e) => setFormState(prev => ({
                  ...prev,
                  newPassword: e.target.value
                }))}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              />
            </div>
            <div>
              <input
                type="password"
                required
                placeholder="Confirm Password"
                value={formState.confirmPassword}
                onChange={(e) => setFormState(prev => ({
                  ...prev,
                  confirmPassword: e.target.value
                }))}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isSubmitting ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordChange;