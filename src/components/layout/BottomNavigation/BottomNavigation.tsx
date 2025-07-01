import React from 'react';
import { Home, FileText, MessageSquare, User, Calendar } from 'lucide-react';
import { ROUTES } from '@/constants';
import { useNavigate, useLocation } from 'react-router-dom';

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

// 방법 2: Props로 activeTab을 받는 경우
interface ManagerFooterProps {
  activeTab?: string;
}

export const ManagerFooter: React.FC<ManagerFooterProps> = ({ activeTab: propActiveTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { id: 'home', icon: Home, label: '홈', path: ROUTES.HOME },
    {
      id: 'calendar',
      icon: Calendar,
      label: '일정',
      path: '/manager/reservations',
    },
    { id: 'consultation', icon: MessageSquare, label: '문의', path: '/board' },
    { id: 'profile', icon: User, label: '프로필', path: '/manager/mypage' },
  ];

  // props로 받은 activeTab이 있으면 우선 사용, 없으면 현재 경로 기반으로 결정
  const getActiveTab = () => {
    if (propActiveTab) return propActiveTab;
    
    const currentPath = location.pathname;
    
    if (currentPath === ROUTES.HOME) return 'home';
    if (currentPath.includes('/manager/reservations')) return 'calendar';
    if (currentPath.includes('/board')) return 'consultation';
    if (currentPath.includes('/manager/mypage')) return 'profile';
    
    return 'home'; // 기본값
  };

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex items-center justify-around">
        {navItems.map(({ id, icon: Icon, label, path }) => {
          const isActive = getActiveTab() === id;
          
          return (
            <button
              key={id}
              onClick={() => handleTabClick(path)}
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