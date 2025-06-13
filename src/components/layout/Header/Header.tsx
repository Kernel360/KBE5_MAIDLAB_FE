import React from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { APP_INFO, ROUTES } from '@/constants';
import { useAuth } from '@/hooks';

interface HeaderProps {
  showNotification?: boolean;
  onNotificationClick?: () => void;
  title?: string;
  onLogoClick?: () => void; // 커스텀 로고 클릭 핸들러 (선택사항)
}

export const Header: React.FC<HeaderProps> = ({
  showNotification = false,
  onNotificationClick,
  title = APP_INFO.NAME,
  onLogoClick,
}) => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      navigate(ROUTES.HOME);
    }
  };

  return (
    <header className="bg-white px-4 py-3 flex items-center justify-between shadow-sm">
      {/* 로고 영역 - 클릭 가능 */}
      <button
        onClick={handleLogoClick}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">M</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      </button>

      <div className="flex items-center gap-2">
        {/* 알림 버튼 */}
        {showNotification && (
          <button
            onClick={onNotificationClick}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
          >
            <Bell className="w-6 h-6 text-gray-600" />
            {/* 알림 뱃지 (선택사항) */}
            {/* <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div> */}
          </button>
        )}
        {/* 로그아웃 버튼 (로그인 상태일 때만) */}
        {isAuthenticated && (
          <button
            onClick={logout}
            className="ml-2 px-3 py-1 rounded text-sm text-gray-600 hover:text-white hover:bg-orange-500 transition-colors"
          >
            로그아웃
          </button>
        )}
      </div>
    </header>
  );
};
