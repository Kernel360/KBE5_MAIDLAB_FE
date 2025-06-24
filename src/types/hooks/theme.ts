import type { Theme, ResolvedTheme } from '@/constants/theme';

// ===== 기본 테마 컨텍스트 타입 =====
export interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  isSystemMode: boolean;
  // 추가 유틸리티 메서드들
  toggleTheme: () => void;
  resetTheme: () => void;
  isSupported: boolean;
}

// ===== 테마 프로바이더 Props =====
export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  enableSystemDetection?: boolean;
  enableTabSync?: boolean;
  enableDomUpdate?: boolean;
  onThemeChange?: ThemeChangeListener;
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
  lastUpdated: Date | null;
}

// ===== 테마 설정 옵션 =====
export interface ThemeOptions {
  detectSystemTheme?: boolean;
  syncAcrossTabs?: boolean;
  updateDOM?: boolean;
  enableTransitions?: boolean;
  persistTheme?: boolean;
  fallbackTheme?: Theme;
}

// ===== 테마 훅 옵션 =====
export interface UseThemeOptions {
  localStorageKey?: string;
  defaultTheme?: Theme;
  enableSystemDetection?: boolean;
  enableStorageSync?: boolean;
  onError?: (error: string) => void;
}

// ===== 테마 메타데이터 =====
export interface ThemeMetadata {
  name: Theme;
  displayName: string;
  description: string;
  icon: string;
  isSystem: boolean;
  resolvedTheme: ResolvedTheme;
  supported: boolean;
  colors: {
    primary: string;
    background: string;
    text: string;
  };
}

// ===== 테마 전환 애니메이션 =====
export interface ThemeTransition {
  duration: number;
  easing: string;
  property: string[];
}

export interface ThemeTransitionOptions {
  enable: boolean;
  duration?: number;
  easing?: string;
  properties?: string[];
}

// ===== 시스템 테마 감지 =====
export interface SystemThemeDetection {
  supported: boolean;
  currentPreference: ResolvedTheme;
  listener: (() => void) | null;
}

// ===== 테마 스토리지 =====
export interface ThemeStorage {
  get: () => Theme | null;
  set: (theme: Theme) => void;
  remove: () => void;
  isSupported: () => boolean;
}

// ===== 테마 에러 =====
export interface ThemeError {
  type: 'storage' | 'dom' | 'system' | 'validation';
  message: string;
  operation: string;
  timestamp: number;
  theme?: Theme;
}

// ===== 고급 테마 훅 결과 =====
export interface AdvancedThemeHookResult extends ThemeContextType {
  // 상태 정보
  state: ThemeState;

  // 메타데이터
  metadata: ThemeMetadata;

  // 유틸리티 메서드
  getThemeIcon: () => string;
  getThemeDisplayName: () => string;
  getThemeDescription: () => string;

  // 테마 비교
  isThemeActive: (theme: Theme) => boolean;
  compareThemes: (theme1: Theme, theme2: Theme) => boolean;

  // 시스템 테마
  systemTheme: ResolvedTheme;
  isSystemThemeSupported: boolean;

  // 에러 처리
  lastError: ThemeError | null;
  clearError: () => void;

  // 개발 도구
  debug: () => void;
}

// ===== 테마 히스토리 =====
export interface ThemeHistoryEntry {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  timestamp: Date;
  source: ThemeChangeEvent['source'];
}

export interface ThemeHistory {
  entries: ThemeHistoryEntry[];
  current: number;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

// ===== 테마 프리셋 =====
export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  theme: Theme;
  colors?: Record<string, string>;
  custom?: boolean;
}

// ===== 테마 커스터마이징 =====
export interface ThemeCustomization {
  colors: Record<string, string>;
  fonts: Record<string, string>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}

// ===== 고급 테마 설정 =====
export interface AdvancedThemeConfig {
  presets: ThemePreset[];
  customization: ThemeCustomization;
  transitions: ThemeTransitionOptions;
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    colorBlindFriendly: boolean;
  };
  debug: {
    enabled: boolean;
    logChanges: boolean;
    showPerformance: boolean;
  };
}
