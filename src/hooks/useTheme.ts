// src/hooks/useTheme.ts - 테마 관련 훅

import React, { createContext, useContext, useState, useEffect } from 'react';
import { setLocalStorage, getLocalStorage } from '@/utils/storage';

// 테마 타입
export type Theme = 'light' | 'dark' | 'system';

// 테마 컨텍스트 타입
interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// 컨텍스트 생성
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 시스템 다크모드 확인
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return 'light';
};

// 실제 테마 계산
const getActualTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
};

// Provider 컴포넌트
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // 로컬스토리지에서 저장된 테마 가져오기 (기본값: system)
  const [theme, setThemeState] = useState<Theme>(() => {
    return getLocalStorage<Theme>('theme') || 'system';
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>(() => {
    return getActualTheme(theme);
  });

  // 테마 설정 함수
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setLocalStorage('theme', newTheme);
  };

  // 테마 토글 함수 (light ↔ dark)
  const toggleTheme = () => {
    if (theme === 'system') {
      // 시스템 모드에서는 현재 시스템 테마의 반대로
      const systemTheme = getSystemTheme();
      setTheme(systemTheme === 'light' ? 'dark' : 'light');
    } else {
      setTheme(theme === 'light' ? 'dark' : 'light');
    }
  };

  // 시스템 테마 변경 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === 'system') {
        setActualTheme(getSystemTheme());
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // 테마 변경 시 실제 테마 업데이트
  useEffect(() => {
    const newActualTheme = getActualTheme(theme);
    setActualTheme(newActualTheme);
  }, [theme]);

  // DOM에 테마 클래스 적용
  useEffect(() => {
    const root = document.documentElement;

    // 이전 테마 클래스 제거
    root.classList.remove('light', 'dark');

    // 새 테마 클래스 추가
    root.classList.add(actualTheme);

    // data-theme 속성도 설정 (일부 라이브러리에서 사용)
    root.setAttribute('data-theme', actualTheme);

    // 메타 태그 업데이트 (상태바 색상 등)
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        actualTheme === 'dark' ? '#1f2937' : '#ffffff',
      );
    }
  }, [actualTheme]);

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
