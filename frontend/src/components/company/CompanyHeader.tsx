import { User, LogOut } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { logout } from '@/redux/slices/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import { IEmployee } from '@/types/IEmployee';
import GlobalNotification from '../chat/GlobalNotification';

export function CompanyHeader() {
  const [imageError, setImageError] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="border-b border-gray-100 bg-gradient-to-r from-blue-100 to-blue-200">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <SidebarTrigger className="-ml-2 mr-2 text-gray-600 hover:text-gray-900" />
        </div>

        <div className="flex items-center gap-4">
          <GlobalNotification />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200"
              >
                {imageError || !user?.userData?.profilePicture ? (
                  <div className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-200 text-blue-700 font-bold">
                    {user?.userData?.companyName?.charAt(0).toUpperCase() || (
                      <User className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                ) : (
                  <img
                    src={(user.userData as IEmployee).profilePicture}
                    alt="Avatar"
                    className="rounded-full h-8 w-8 object-cover"
                    onError={() => setImageError(true)}
                  />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/company/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 "
                onClick={handleLogout}
              >
                Log out
                <LogOut className="h-5 w-5 text-red-600 " />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
