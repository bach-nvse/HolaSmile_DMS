import { useState, useEffect, useRef } from 'react';
import { Menu, User, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router';
import { NotificationButton } from "@/components/notification/NotificationButton"; // cập nhật đúng path của bạn

interface UserInfo {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface StaffHeaderProps {
  userInfo: UserInfo;
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
  isMobile?: boolean;
  isCollapsed?: boolean;
}

export const StaffHeader: React.FC<StaffHeaderProps> = ({ userInfo, onToggleSidebar, isSidebarOpen = false, isMobile = false, isCollapsed = false }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/');
  };

  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'Administrator': 'Quản trị viên',
      'Owner': 'Chủ sở hữu',
      'Receptionist': 'Lễ tân',
      'Assistant': 'Trợ lý',
      'Dentist': 'Nha sĩ'
    };
    return roleMap[role] || role;
  };

  const getHeaderMargin = () => {
    if (isMobile) return '0px';
    return isCollapsed ? '64px' : '256px';
  };

  return (
    <header 
      className={`${isMobile ? 'relative' : 'fixed top-0 right-0'} bg-white border-b border-gray-300 h-16 flex items-center justify-between px-4 sm:px-6 z-40 transition-all duration-300`}
      style={!isMobile ? { left: getHeaderMargin() } : {}}
    >
      {/* Left side */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Show menu button only on mobile */}
        {isMobile && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            title="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        
        <div className="hidden sm:block">
          <h1 className="text-lg font-semibold text-gray-900">
            Hệ Thống Quản Lý Nha Khoa
          </h1>
        </div>
        
        {/* Mobile title */}
        <div className="sm:hidden">
          <h1 className="text-base font-semibold text-gray-900">HolaSmile</h1>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Notifications */}
        <div 
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full relative"
          title="Thông báo"
        >
          <NotificationButton />
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={toggleUserMenu}
            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-sm font-medium">{userInfo.name}</p>
              <p className="text-xs text-gray-500">{getRoleDisplayName(userInfo.role)}</p>
            </div>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-300">
                <p className="text-sm font-medium text-gray-900">{userInfo.name}</p>
                <p className="text-sm text-gray-500">{userInfo.email}</p>
                <p className="text-xs text-blue-600 font-medium">{getRoleDisplayName(userInfo.role)}</p>
              </div>
              
              <button
                onClick={() => navigate('/view-profile')}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <User className="h-4 w-4 mr-2" />
                Thông Tin Cá Nhân
              </button>
              
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <Settings className="h-4 w-4 mr-2" />
                Cài Đặt
              </button>
              
              
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left border-t border-gray-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Đăng Xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};