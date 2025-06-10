import React from 'react';
import { Bell } from 'lucide-react';
import { APP_INFO } from '@/constants';

interface HeaderProps {
  showNotification?: boolean;
  onNotificationClick?: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({
  showNotification = false,
  onNotificationClick,
  title = APP_INFO.NAME,
}) => {
  return (
    <header className="bg-white px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">M</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      </div>

      {showNotification && (
        <button
          onClick={onNotificationClick}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Bell className="w-6 h-6 text-gray-600" />
        </button>
      )}
    </header>
  );
};
