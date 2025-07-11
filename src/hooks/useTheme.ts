import React, { createContext, useContext, useState, useEffect } from 'react';
import { setLocalStorage, getLocalStorage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/storage';
import { DEFAULT_THEME, SUPPORTED_THEMES } from '@/constants/theme';
import {
  resolveTheme,
  createSystemThemeListener,
  sanitizeTheme,
  getNextTheme,
} from '@/utils/theme';
import type { ThemeContextType, ThemeProviderProps } from '@/types/hooks/theme';
import type { ResolvedTheme } from '@/constants/theme';

// ===== 테마 컨텍스트 생성 =====
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ===== DOM에 테마 적용 =====
const applyThemeToDOM = (theme: ResolvedTheme): void => {
  const root = document.documentElement;

  // 기존 테마 클래스 제거
  root.classList.remove('light', 'dark');

  // 새 테마 클래스 추가
  root.classList.add(theme);
  root.setAttribute('data-theme', theme);

  // 메타 태그 업데이트 (PWA 지원)
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    const themeColor = theme === 'dark' ? '#1f2937' : '#ffffff';
    metaThemeColor.setAttribute('content', themeColor);
  }
};

// ===== 테마 프로바이더 =====
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = DEFAULT_THEME,
  storageKey = STORAGE_KEYS.THEME || 'theme',
}) => {
  // 초기 테마 설정
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return defaultTheme;

    const savedTheme = getLocalStorage<string>(storageKey);
    return sanitizeTheme(savedTheme) || defaultTheme;
  });

  const resolvedTheme = resolveTheme(theme);

  // 테마 설정 함수
  const setTheme = (newTheme: typeof theme) => {
    // 지원되는 테마인지 확인
    if (!SUPPORTED_THEMES.includes(newTheme)) {
      console.warn(`지원되지 않는 테마입니다: ${newTheme}`);
      return;
    }

    setThemeState(newTheme);
    setLocalStorage(storageKey, newTheme);
  };

  // 시스템 테마 변경 감지 (system 모드일 때만)
  useEffect(() => {
    if (theme !== 'system') return;

    const unsubscribe = createSystemThemeListener(() => {
      // 시스템 테마가 변경되어도 현재는 라이트모드 유지
      // 향후 다크모드 지원시 여기서 실제 테마 변경 처리
    });

    return unsubscribe;
  }, [theme]);

  // DOM에 테마 적용
  useEffect(() => {
    applyThemeToDOM(resolvedTheme);
  }, [resolvedTheme]);

  // localStorage 변경 감지 (다른 탭에서 테마 변경시 동기화)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          // localStorage에서 저장된 형태에 따라 파싱
          const parsedValue = JSON.parse(e.newValue);
          const newTheme = sanitizeTheme(parsedValue.value || parsedValue);

          if (newTheme !== theme) {
            setThemeState(newTheme);
          }
        } catch (error) {
          // JSON 파싱 실패시 무시
          console.warn('테마 값 파싱에 실패했습니다:', e.newValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [theme, storageKey]);

  const toggleTheme = () => {
    const nextTheme = getNextTheme(theme);
    setTheme(nextTheme);
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
  };

  // 컨텍스트 값
  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    isSystemMode: theme === 'system',
    toggleTheme,
    resetTheme,
  };

  return React.createElement(ThemeContext.Provider, { value }, children);
};

// ===== 테마 훅 =====
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

// ===== 편의 훅들 =====
export const useIsSystemMode = (): boolean => {
  const { isSystemMode } = useTheme();
  return isSystemMode;
};

export const useThemeSetter = () => {
  const { setTheme } = useTheme();
  return setTheme;
};

// ===== 테마 토글 훅 =====
export const useThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    // light → dark → system → light 순환
    const nextTheme = getNextTheme(theme);
    setTheme(nextTheme);
  };

  return toggleTheme;
};
