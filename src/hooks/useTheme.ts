// src/hooks/useTheme.ts - 라이트모드 전용 테마 훅

import React, { createContext, useContext, useState, useEffect } from 'react';
import { setLocalStorage, getLocalStorage } from '@/utils/storage';

// 테마 타입 (라이트모드만)
export type Theme = 'light';

// 테마 컨텍스트 타입
interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void; // 기존 호환성을 위해 유지하지만 동작하지 않음
}

// 컨텍스트 생성
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider 컴포넌트
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // 항상 라이트 테마로 고정
  const [theme] = useState<Theme>('light');
  const [actualTheme] = useState<'light'>('light');

  // 테마 설정 함수 (라이트모드로 고정)
  const setTheme = (newTheme: Theme) => {
    // 라이트 테마만 허용
    if (newTheme === 'light') {
      setLocalStorage('theme', 'light');
    }
  };

  // 테마 토글 함수 (동작하지 않음 - 기존 호환성을 위해 유지)
  const toggleTheme = () => {
    // 라이트모드 고정이므로 아무것도 하지 않음
    console.log('테마는 라이트모드로 고정되어 있습니다.');
  };

  // DOM에 라이트 테마 클래스 적용
  useEffect(() => {
    const root = document.documentElement;

    // 다크모드 클래스 제거 및 라이트모드 클래스 적용
    root.classList.remove('dark');
    root.classList.add('light');

    // data-theme 속성 설정
    root.setAttribute('data-theme', 'light');

    // 메타 태그 업데이트 (라이트모드 색상)
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#ffffff');
    }
  }, []);

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme,
    toggleTheme,
  };

  return React.createElement(ThemeContext.Provider, { value }, children);
};

// 훅 함수
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};