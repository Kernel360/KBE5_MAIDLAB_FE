import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  ArrowLeft,
  Menu,
  CalendarDays,
  HelpCircle,
  User,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { APP_INFO, ROUTES } from '@/constants';
import { useAuth, useToast } from '@/hooks';
import { ThemeToggle } from '@/components/common/ThemeToggle';

interface HeaderProps {
  variant?: 'main' | 'sub';
  showNotification?: boolean;
  onNotificationClick?: () => void;
  title?: string;
  onLogoClick?: () => void;
  onBackClick?: () => void;
  backRoute?: string;
  showMenu?: boolean;
  hideBackButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  variant = 'main',
  showNotification = false,
  title = APP_INFO.NAME,
  onLogoClick,
  onBackClick,
  backRoute,
  showMenu = false,
  hideBackButton = false,
}) => {
  const navigate = useNavigate();
  const { logout, isAuthenticated, userType } = useAuth();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogoClick = () => {
    if (onLogoClick) onLogoClick();
    else navigate(ROUTES.HOME);
  };

  const handleNotificationClick = () => {
    showToast('알람 기능을 준비 중입니다.', 'info');
  };

  const handleBackClick = () => {
    if (onBackClick) onBackClick();
    else if (backRoute) navigate(backRoute);
    else navigate(-1);
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleMenuClick = (route: string | (() => void)) => {
    setMenuOpen(false);
    if (typeof route === 'string') {
      navigate(route);
    } else {
      route(); // 예: logout
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'sub') {
    if (hideBackButton) {
      return (
        <header className="sticky top-0 z-[9999] flex items-center justify-between px-4 py-[18px] border-b bg-white dark:bg-gray-900 dark:border-gray-700 transition-colors">
          <div className="w-10" />
          <h1 className="text-lg font-bold text-center w-full text-gray-900 dark:text-white">{title}</h1>
          <div className="w-10" />
        </header>
      );
    }
    return (
      <header className="sticky top-0 z-[9999] flex items-center justify-between px-4 p-3 border-b bg-white dark:bg-gray-900 dark:border-gray-700 transition-colors">
        <button
          onClick={handleBackClick}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h1>
        <div className="flex items-center gap-2">
          {showNotification && (
            <button
              onClick={handleNotificationClick}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-white" />
            </button>
          )}
          {showMenu && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={toggleMenu}
                className={`p-2 rounded-full transition-colors ${menuOpen ? 'bg-orange-500' : 'hover:bg-gray-100'}`}
              >
                <Menu
                  className={`w-6 h-6 ${menuOpen ? 'text-white' : 'text-gray-700 dark:text-white'}`}
                />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-4 w-48 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-md z-50 flex flex-col py-2">
                  <button
                    onClick={handleLogoClick}
                    className="w-full px-4 pt-3 pb-5 flex items-center justify-center gap-2 text-center font-bold text-black dark:text-white text-lg hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600"
                    style={{ letterSpacing: '2px' }}
                  >
                    <span className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-base">M</span>
                    </span>
                    <span>MAIDLAB</span>
                  </button>
                  {isAuthenticated ? (
                    <>
                      <button
                        onClick={() =>
                          handleMenuClick(
                            userType === 'MANAGER'
                              ? ROUTES.MANAGER.RESERVATIONS
                              : ROUTES.CONSUMER.RESERVATIONS,
                          )
                        }
                        className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 gap-2 text-gray-700 dark:text-gray-200"
                      >
                        <CalendarDays className="w-5 h-5 text-gray-600 dark:text-white" />
                        <span>예약</span>
                      </button>
                      <button
                        onClick={() => handleMenuClick(ROUTES.BOARD.LIST)}
                        className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 gap-2 text-gray-700 dark:text-gray-200"
                      >
                        <HelpCircle className="w-5 h-5 text-gray-600 dark:text-white" />
                        <span>문의</span>
                      </button>
                      <button
                        onClick={() =>
                          handleMenuClick(
                            userType === 'MANAGER'
                              ? ROUTES.MANAGER.MYPAGE
                              : ROUTES.CONSUMER.MYPAGE,
                          )
                        }
                        className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 gap-2 text-gray-700 dark:text-gray-200"
                      >
                        <User className="w-5 h-5 text-gray-600 dark:text-white" />
                        <span>마이페이지</span>
                      </button>
                      <button
                        onClick={() => handleMenuClick(logout)}
                        className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 gap-2 text-gray-700 dark:text-gray-200"
                      >
                        <LogOut className="w-5 h-5 text-gray-600 dark:text-white" />
                        <span>로그아웃</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleMenuClick(ROUTES.LOGIN)}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 gap-2"
                    >
                      <User className="w-5 h-5 text-gray-600" />
                      <span>로그인</span>
                    </button>
                  )}
                  
                  {/* 테마 토글 스위치 - 모든 사용자 */}
                  <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-600 flex justify-center">
                    <ThemeToggle 
                      variant="switch" 
                      size="sm" 
                      showLabel={false}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          {!showNotification && !showMenu && <div className="w-10" />}
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-[9999] bg-white dark:bg-gray-900 px-4 p-3 flex items-center justify-between shadow-sm transition-colors">
      <button
        onClick={handleLogoClick}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">M</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
      </button>

      <div className="flex items-center gap-2 relative" ref={menuRef}>
        {showNotification && (
          <button
            onClick={handleNotificationClick}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
          >
            <Bell className="w-6 h-6 text-gray-600 dark:text-white" />
          </button>
        )}

        {isAuthenticated && (
          <>
            <button
              onClick={toggleMenu}
              className={`p-2 rounded-full transition-colors ${menuOpen ? 'bg-orange-500' : 'hover:bg-gray-100'}`}
            >
              <Menu
                className={`w-6 h-6 ${menuOpen ? 'text-white' : 'text-gray-700 dark:text-white'}`}
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-4 w-48 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-md z-50 flex flex-col py-2">
                <button
                  onClick={handleLogoClick}
                  className="w-full px-4 pt-3 pb-5 flex items-center justify-center gap-2 text-center font-bold text-black dark:text-white text-lg hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600"
                  style={{ letterSpacing: '2px' }}
                >
                  <span className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-base">M</span>
                  </span>
                  <span>MAIDLAB</span>
                </button>
                {isAuthenticated && (
                  <>
                    <button
                      onClick={() =>
                        handleMenuClick(
                          userType === 'MANAGER'
                            ? ROUTES.MANAGER.RESERVATIONS
                            : ROUTES.CONSUMER.RESERVATIONS,
                        )
                      }
                      className="flex items-center px-4 py-2 hover:bg-gray-100 gap-2"
                    >
                      <CalendarDays className="w-5 h-5 text-gray-600" />
                      <span>예약</span>
                    </button>
                    <button
                      onClick={() => handleMenuClick(ROUTES.BOARD.LIST)}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 gap-2"
                    >
                      <HelpCircle className="w-5 h-5 text-gray-600" />
                      <span>문의</span>
                    </button>
                    <button
                      onClick={() =>
                        handleMenuClick(
                          userType === 'MANAGER'
                            ? ROUTES.MANAGER.MYPAGE
                            : ROUTES.CONSUMER.MYPAGE,
                        )
                      }
                      className="flex items-center px-4 py-2 hover:bg-gray-100 gap-2"
                    >
                      <User className="w-5 h-5 text-gray-600" />
                      <span>마이페이지</span>
                    </button>
                    <button
                      onClick={() => handleMenuClick(logout)}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 gap-2"
                    >
                      <LogOut className="w-5 h-5 text-gray-600" />
                      <span>로그아웃</span>
                    </button>
                    
                    {/* 테마 토글 스위치 - 로그인 사용자 */}
                    <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-600 flex justify-center">
                      <ThemeToggle 
                        variant="switch" 
                        size="sm" 
                        showLabel={false}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
        {!isAuthenticated && (
          <>
            <button
              onClick={toggleMenu}
              className={`p-2 rounded-full transition-colors ${menuOpen ? 'bg-orange-500' : 'hover:bg-gray-100'}`}
            >
              <Menu
                className={`w-6 h-6 ${menuOpen ? 'text-white' : 'text-gray-700 dark:text-white'}`}
              />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-4 w-48 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-md z-50 flex flex-col py-2">
                <button
                  onClick={handleLogoClick}
                  className="w-full px-4 pt-3 pb-5 flex items-center justify-center gap-2 text-center font-bold text-black dark:text-white text-lg hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600"
                  style={{ letterSpacing: '2px' }}
                >
                  <span className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-base">M</span>
                  </span>
                  <span>MAIDLAB</span>
                </button>
                <button
                  onClick={() => handleMenuClick(ROUTES.LOGIN)}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 gap-2"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span>로그인</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
};
