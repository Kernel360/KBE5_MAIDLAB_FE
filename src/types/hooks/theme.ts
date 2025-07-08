import type { Theme, ResolvedTheme } from '@/constants/theme';

// ===== 기본 테마 컨텍스트 타입 =====
export interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  isSystemMode: boolean;
  toggleTheme: () => void;
  resetTheme: () => void;
}

// ===== 테마 프로바이더 Props =====
export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  enableSystemDetection?: boolean;
}

// ===== 테마 변경 이벤트 =====
export interface ThemeChangeEvent {
  oldTheme: Theme;
  newTheme: Theme;
  resolvedOldTheme: ResolvedTheme;
  resolvedNewTheme: ResolvedTheme;
  timestamp: number;
  source: 'user' | 'system' | 'storage' | 'default';
}

export type ThemeChangeListener = (event: ThemeChangeEvent) => void;

// ===== 테마 상태 =====
export interface ThemeState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  isSystemMode: boolean;
  isLoading: boolean;
  error: string | null;
}

// ===== 테마 훅 옵션 =====
export interface UseThemeOptions {
  localStorageKey?: string;
  defaultTheme?: Theme;
  enableSystemDetection?: boolean;
  onError?: (error: string) => void;
}