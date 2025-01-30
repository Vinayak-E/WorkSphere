import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setUser, logout } from '@/redux/slices/authSlice';
import api from '@/api/axios';
import { ScaleLoader } from 'react-spinners';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await api.get('/auth/verify-token'); 
        if (response.data.success) {
          dispatch(setUser({
            email: response.data.email,
            role: response.data.role,
            tenantId: response.data.tenantId,
          }));
        } else {
          dispatch(logout());
          navigate('/login');
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        dispatch(logout());
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [dispatch, navigate]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <ScaleLoader color="rgb(37, 99, 235)" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
