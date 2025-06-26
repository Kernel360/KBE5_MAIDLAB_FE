import React, { useState } from 'react';
import { Home, FileText, MessageSquare, User, Calendar } from 'lucide-react';
import { ROUTES } from '@/constants';
import { useNavigate } from 'react-router-dom';

interface BottomNavigationProps {
  activeTab: 'home' | 'reservation' | 'consultation' | 'profile';
  onTabClick: (path: string) => void;
  isAuthenticated: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabClick,
  isAuthenticated,
}) => {
  const navItems = [
    {
      id: 'home',
      icon: Home,
      label: '홈',
      path: ROUTES.HOME,
    },
    {
      id: 'reservation',
      icon: FileText,
      label: '예약',
      path: isAuthenticated ? ROUTES.CONSUMER.RESERVATIONS : ROUTES.LOGIN,
    },
    {
      id: 'consultation',
      icon: MessageSquare,
      label: '상담',
      path: ROUTES.BOARD.LIST,
    },
    {
      id: 'profile',
      icon: User,
      label: isAuthenticated ? '내정보' : '로그인',
      path: isAuthenticated ? ROUTES.CONSUMER.MYPAGE : ROUTES.LOGIN,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex items-center justify-around">
        {navItems.map(({ id, icon: Icon, label, path }) => {
          const isActive = activeTab === id;

          return (
            <button
              key={id}
              onClick={() => onTabClick(path)}
              className="flex flex-col items-center py-2 transition-colors"
            >
              <Icon
                className={`w-6 h-6 mb-1 ${
                  isActive ? 'text-orange-500' : 'text-gray-400'
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  isActive ? 'text-orange-500' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export const ManagerFooter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home'); // 기본값 '홈' 활성화
  const navigate = useNavigate();
  const navItems = [
    { id: 'home', icon: Home, label: '홈', path: ROUTES.HOME },
    {
      id: 'calendar',
      icon: Calendar,
      label: '일정',
      path: '/manager/reservations',
    }, // 매니저 일정
    { id: 'consultation', icon: MessageSquare, label: '문의', path: '/board' }, // 매니저 문의(공통 게시판)
    { id: 'profile', icon: User, label: '프로필', path: '/manager/mypage' }, // 매니저 마이페이지
  ];
  const handleTabClick = (id: string, path: string) => {
    setActiveTab(id);
    if (path) navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex items-center justify-around">
        {navItems.map(({ id, icon: Icon, label, path }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => handleTabClick(id, path)}
              className="flex flex-col items-center py-2 transition-colors focus:outline-none"
              type="button"
            >
              <Icon
                className={`w-6 h-6 mb-1 ${
                  isActive ? 'text-[#FFA800]' : 'text-gray-400'
                }`}
                fill={isActive ? '#FFA800' : 'none'}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span
                className={`text-xs font-medium ${
                  isActive ? 'text-[#FFA800]' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
