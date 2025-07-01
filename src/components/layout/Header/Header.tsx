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
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-[18px] border-b bg-white">
          <div className="w-10" />
          <h1 className="text-lg font-bold text-center w-full">{title}</h1>
          <div className="w-10" />
        </header>
      );
    }
    return (
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 p-3 border-b bg-white">
        <button
          onClick={handleBackClick}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">{title}</h1>
        <div className="flex items-center gap-2">
          {showNotification && (
            <button
              onClick={handleNotificationClick}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
            >
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
          )}
          {showMenu && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={toggleMenu}
                className={`p-2 rounded-full transition-colors ${menuOpen ? 'bg-orange-500' : 'hover:bg-gray-100'}`}
              >
                <Menu
                  className={`w-6 h-6 ${menuOpen ? 'text-white' : 'text-gray-700'}`}
                />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-4 w-48 bg-white border rounded-lg shadow-md z-50 flex flex-col py-2">
                  <button
                    onClick={handleLogoClick}
                    className="w-full px-4 pt-3 pb-5 flex items-center justify-center gap-2 text-center font-bold text-black text-lg hover:bg-gray-50 border-b border-gray-100"
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
                    </>
                  )}
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white px-4 p-3 flex items-center justify-between shadow-sm">
      <button
        onClick={handleLogoClick}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">M</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      </button>

      <div className="flex items-center gap-2 relative" ref={menuRef}>
        {showNotification && (
          <button
            onClick={handleNotificationClick}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
          >
            <Bell className="w-6 h-6 text-gray-600" />
          </button>
        )}

        {isAuthenticated && (
          <>
            <button
              onClick={toggleMenu}
              className={`p-2 rounded-full transition-colors ${menuOpen ? 'bg-orange-500' : 'hover:bg-gray-100'}`}
            >
              <Menu
                className={`w-6 h-6 ${menuOpen ? 'text-white' : 'text-gray-700'}`}
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-4 w-48 bg-white border rounded-lg shadow-md z-50 flex flex-col py-2">
                <button
                  onClick={handleLogoClick}
                  className="w-full px-4 pt-3 pb-5 flex items-center justify-center gap-2 text-center font-bold text-black text-lg hover:bg-gray-50 border-b border-gray-100"
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
                className={`w-6 h-6 ${menuOpen ? 'text-white' : 'text-gray-700'}`}
              />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-4 w-48 bg-white border rounded-lg shadow-md z-50 flex flex-col py-2">
                <button
                  onClick={handleLogoClick}
                  className="w-full px-4 pt-3 pb-5 flex items-center justify-center gap-2 text-center font-bold text-black text-lg hover:bg-gray-50 border-b border-gray-100"
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
