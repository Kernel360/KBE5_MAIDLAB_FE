import React from 'react';
import { Home, FileText, MessageSquare, User } from 'lucide-react';
import { ROUTES } from '@/constants';

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
