import {
  SYSTEM_THEME_QUERY,
  SUPPORTED_THEMES,
  DEFAULT_THEME,
  THEME_CONFIG,
  type Theme,
  type ResolvedTheme,
} from '@/constants';

// ===== 에러 처리 =====
export const handleThemeError = (operation: string, error: unknown): void => {
  console.error(`Theme ${operation} error:`, error);
};

// ===== 시스템 테마 감지 =====
export const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light';

  try {
    return window.matchMedia(SYSTEM_THEME_QUERY).matches ? 'dark' : 'light';
  } catch (error) {
    handleThemeError('system_detection', error);
    return 'light';
  }
};

export const resolveTheme = (theme: Theme): ResolvedTheme => {
  try {
    return theme === 'system' ? getSystemTheme() : (theme as ResolvedTheme);
  } catch (error) {
    handleThemeError('theme_resolution', error);
    return 'light';
  }
};

// ===== 시스템 테마 변경 감지 =====
export const createSystemThemeListener = (
  callback: () => void,
): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  if (!THEME_CONFIG.ENABLE_SYSTEM_DETECTION) {
    return () => {};
  }

  try {
    const mediaQuery = window.matchMedia(SYSTEM_THEME_QUERY);

    const handler = () => {
      try {
        // 시스템이 다크모드로 변경되어도 현재는 라이트모드 유지
        callback();
      } catch (error) {
        handleThemeError('system_theme_change', error);
      }
    };

    // 최신 브라우저 API 사용
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      // 레거시 브라우저 지원
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  } catch (error) {
    handleThemeError('system_listener_creation', error);
    return () => {};
  }
};

// ===== 테마 검증 =====
export const isValidTheme = (value: unknown): value is Theme => {
  return typeof value === 'string' && SUPPORTED_THEMES.includes(value as Theme);
};

export const sanitizeTheme = (value: unknown): Theme => {
  try {
    if (isValidTheme(value)) {
      return value;
    }

    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `Invalid theme value: ${value}, falling back to default: ${DEFAULT_THEME}`,
      );
    }

    return DEFAULT_THEME;
  } catch (error) {
    handleThemeError('theme_sanitization', error);
    return DEFAULT_THEME;
  }
};

// ===== 테마 상태 확인 =====
export const isSystemTheme = (theme: Theme): boolean => {
  return theme === 'system';
};

export const isLightTheme = (theme: ResolvedTheme): boolean => {
  return theme === 'light';
};

export const isDarkTheme = (theme: ResolvedTheme): boolean => {
  return theme === 'dark';
};

// ===== 테마 표시명 =====
export const getThemeDisplayName = (theme: Theme): string => {
  const displayNames: Record<Theme, string> = {
    light: '라이트 모드',
    dark: '다크 모드',
    system: '시스템 설정',
  };

  return displayNames[theme] || theme;
};

// ===== 테마 아이콘 =====
export const getThemeIcon = (theme: Theme): string => {
  const iconNames: Record<Theme, string> = {
    light: '☀️',
    dark: '🌙',
    system: '💻',
  };

  return iconNames[theme] || '🎨';
};

// ===== 테마 설명 =====
export const getThemeDescription = (theme: Theme): string => {
  const descriptions: Record<Theme, string> = {
    light: '밝은 화면으로 표시됩니다',
    dark: '어두운 화면으로 표시됩니다',
    system: '시스템 설정을 따라갑니다',
  };

  return descriptions[theme] || '';
};

// ===== 테마 유틸리티 =====
export const getNextTheme = (currentTheme: Theme): Theme => {
  // light → dark → system → light 순환
  const themeOrder: Theme[] = ['light', 'dark', 'system'];
  const currentIndex = themeOrder.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % themeOrder.length;

  return themeOrder[nextIndex];
};

export const getPreviousTheme = (currentTheme: Theme): Theme => {
  const themeOrder: Theme[] = ['light', 'dark', 'system'];
  const currentIndex = themeOrder.indexOf(currentTheme);
  const previousIndex =
    currentIndex === 0 ? themeOrder.length - 1 : currentIndex - 1;

  return themeOrder[previousIndex];
};

// ===== 테마 비교 =====
export const compareThemes = (theme1: Theme, theme2: Theme): boolean => {
  return theme1 === theme2;
};

export const isThemeChanged = (oldTheme: Theme, newTheme: Theme): boolean => {
  return !compareThemes(oldTheme, newTheme);
};

// ===== 브라우저 호환성 =====
export const isThemeSupported = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    // 미디어 쿼리 지원 확인
    return Boolean(window.matchMedia);
  } catch {
    return false;
  }
};

export const isDarkModeSupported = (): boolean => {
  if (!isThemeSupported()) return false;

  try {
    return Boolean(window.matchMedia(SYSTEM_THEME_QUERY));
  } catch {
    return false;
  }
};

// ===== 테마 메타데이터 =====
export const getThemeMetadata = (theme: Theme) => {
  return {
    name: theme,
    displayName: getThemeDisplayName(theme),
    description: getThemeDescription(theme),
    icon: getThemeIcon(theme),
    isSystem: isSystemTheme(theme),
    resolvedTheme: resolveTheme(theme),
    supported: SUPPORTED_THEMES.includes(theme),
  };
};

// ===== 개발 도구 =====
export const debugTheme = () => {
  if (process.env.NODE_ENV !== 'development') return;

  console.group('🎨 Theme Debug Info');

  console.groupEnd();
};

// 개발 모드에서 전역 함수 등록
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).__debugTheme = debugTheme;
}
