import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { getThemeDisplayName } from '@/utils/theme';

interface ThemeToggleProps {
  variant?: 'switch' | 'button';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'switch',
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-20 h-8',
    md: 'w-24 h-10',
    lg: 'w-28 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const thumbSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const handleLightClick = () => {
    setTheme('light');
  };

  const handleDarkClick = () => {
    setTheme('dark');
  };

  const handleSystemClick = () => {
    setTheme('system');
  };

  const getThemeIconComponent = (themeType: string) => {
    switch (themeType) {
      case 'light':
        return <Sun className={`${iconSizes[size]} text-white`} />;
      case 'dark':
        return <Moon className={`${iconSizes[size]} text-white`} />;
      case 'system':
        return <Monitor className={`${iconSizes[size]} text-white`} />;
      default:
        return <Sun className={`${iconSizes[size]} text-white`} />;
    }
  };

  if (variant === 'button') {
    const cycleTheme = () => {
      if (theme === 'light') setTheme('dark');
      else if (theme === 'dark') setTheme('system');
      else setTheme('light');
    };

    return (
      <button
        onClick={cycleTheme}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border
          hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
          ${className}
        `}
        title={`현재: ${getThemeDisplayName(theme)}`}
      >
        {getThemeIconComponent(theme)}
        {showLabel && (
          <span className="text-sm font-medium">
            {getThemeDisplayName(theme)}
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      className={`theme-toggle flex items-center justify-center ${className}`}
    >
      <div
        className={`relative ${sizeClasses[size]} bg-gray-200 dark:bg-gray-600 rounded-full p-1 transition-colors duration-300`}
      >
        {/* 배경 트랙 - 3개 영역 */}
        <div className="absolute inset-1 flex">
          {/* 라이트 모드 영역 */}
          <div className="flex-1 flex items-center justify-center">
            <Sun className={`${iconSizes[size]} text-gray-400`} />
          </div>
          {/* 시스템 모드 영역 */}
          <div className="flex-1 flex items-center justify-center">
            <Monitor className={`${iconSizes[size]} text-gray-400`} />
          </div>
          {/* 다크 모드 영역 */}
          <div className="flex-1 flex items-center justify-center">
            <Moon className={`${iconSizes[size]} text-gray-400`} />
          </div>
        </div>

        {/* 슬라이딩 버튼 */}
        <div
          className={`
            absolute top-1 ${thumbSizes[size]} bg-white dark:bg-gray-800 rounded-full shadow-md 
            transition-all duration-300 ease-in-out flex items-center justify-center z-10
          `}
          style={{
            left:
              theme === 'light'
                ? '4px'
                : theme === 'system'
                  ? 'calc(33.33% + 2px)'
                  : 'calc(66.66% + 0px)',
          }}
        >
          {theme === 'light' && (
            <Sun className={`${iconSizes[size]} text-yellow-500`} />
          )}
          {theme === 'system' && (
            <Monitor className={`${iconSizes[size]} text-blue-500`} />
          )}
          {theme === 'dark' && (
            <Moon className={`${iconSizes[size]} text-slate-600`} />
          )}
        </div>

        {/* 클릭 가능한 영역들 - 3개 영역 */}
        <button
          onClick={handleLightClick}
          className="absolute left-0 top-0 w-1/3 h-full rounded-l-full"
          title="라이트 모드"
        />
        <button
          onClick={handleSystemClick}
          className="absolute left-1/3 top-0 w-1/3 h-full"
          title="시스템 모드"
        />
        <button
          onClick={handleDarkClick}
          className="absolute right-0 top-0 w-1/3 h-full rounded-r-full"
          title="다크 모드"
        />
      </div>

      {showLabel && (
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
          {getThemeDisplayName(theme)}
        </span>
      )}
    </div>
  );
};

// 간단한 아이콘만 있는 버전
export const ThemeToggleIcon: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <button
      onClick={cycleTheme}
      className={`
        p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 
        transition-colors ${className}
      `}
      title={`테마 변경 (현재: ${getThemeDisplayName(theme)})`}
    >
      {theme === 'light' && <Sun className="w-5 h-5 text-yellow-500" />}
      {theme === 'dark' && <Moon className="w-5 h-5 text-slate-700" />}
      {theme === 'system' && <Monitor className="w-5 h-5 text-blue-500" />}
    </button>
  );
};
