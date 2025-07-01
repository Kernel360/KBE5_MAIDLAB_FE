import React from 'react';
import { Bell, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { APP_INFO, ROUTES } from '@/constants';
import { useAuth, useToast } from '@/hooks';

interface HeaderProps {
  variant?: 'main' | 'sub';
  showNotification?: boolean;
  onNotificationClick?: () => void;
  title?: string;
  onLogoClick?: () => void;
  onBackClick?: () => void;
  backRoute?: string;
}

export const Header: React.FC<HeaderProps> = ({
  variant = 'main',
  showNotification = false,
  title = APP_INFO.NAME,
  onLogoClick,
  onBackClick,
  backRoute,
}) => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      navigate(ROUTES.HOME);
    }
  };

  const handleNotificationClick = () => {
    showToast('알람 기능을 준비 중입니다.', 'info');
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else if (backRoute) {
      navigate(backRoute);
    } else {
      navigate(-1);
    }
  };

  // 서브 페이지 헤더 렌더링
  if (variant === 'sub') {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 border-b bg-white">
        <button
          onClick={handleBackClick}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">{title}</h1>
        <div className="flex items-center gap-2">
          {/* 서브 페이지에서는 알림만 표시 */}
          {showNotification && (
            <button
              onClick={handleNotificationClick}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
            >
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
          )}
          {/* 알림이 없으면 빈 공간으로 균형 맞춤 */}
          {!showNotification && <div className="w-10" />}
        </div>
      </header>
    );
  }

  // 메인 페이지 헤더 렌더링 (기존 코드)
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
            onClick={handleNotificationClick}
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
