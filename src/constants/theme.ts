// ===== 기본 테마 설정 =====
export const THEME_TYPES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const DEFAULT_THEME: Theme = 'light';
export const SUPPORTED_THEMES: Theme[] = ['light', 'dark', 'system'];

// ===== 테마 관련 설정 =====
export const THEME_STORAGE_KEY = 'theme';
export const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)';

// ===== DOM 테마 설정 =====
export const THEME_DOM_CONFIG = {
  LIGHT: {
    CLASS_NAME: 'light',
    DATA_ATTRIBUTE: 'light',
    META_COLOR: '#ffffff',
  },
  // 다크모드 준비
  DARK: {
    CLASS_NAME: 'dark',
    DATA_ATTRIBUTE: 'dark',
    META_COLOR: '#1f2937',
  },
} as const;

// ===== 테마 에러 메시지 =====
export const THEME_ERRORS = {
  UNSUPPORTED: '지원되지 않는 테마입니다',
  STORAGE_FAILED: '테마 저장에 실패했습니다',
  SYNC_FAILED: '테마 동기화에 실패했습니다',
  DOM_UPDATE_FAILED: '테마 DOM 업데이트에 실패했습니다',
} as const;

// ===== 테마 설정 =====
export const THEME_CONFIG = {
  ENABLE_SYSTEM_DETECTION: true,
  ENABLE_TAB_SYNC: true,
  ENABLE_DOM_UPDATE: true,
  AUTO_APPLY_ON_LOAD: true,
} as const;

// ===== 주요 브랜드 컬러 =====
export const COLORS = {
  // 주요 브랜드 컬러 (오렌지 계열)
  PRIMARY: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316', // 메인 브랜드 컬러
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },

  // 회색 계열
  GRAY: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // 상태 컬러
  SUCCESS: {
    50: '#E8F5E8',
    500: '#4CAF50',
    600: '#43A047',
  },

  WARNING: {
    50: '#FFF8E1',
    500: '#FFC107',
    600: '#FFB300',
  },

  ERROR: {
    50: '#FFEBEE',
    500: '#F44336',
    600: '#E53935',
  },

  INFO: {
    50: '#E1F5FE',
    500: '#03A9F4',
    600: '#039BE5',
  },
} as const;

// ===== 타이포그래피 =====
export const TYPOGRAPHY = {
  FONT_FAMILY: {
    PRIMARY:
      "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif",
    MONOSPACE: "'Fira Code', 'Monaco', 'Consolas', monospace",
  },

  FONT_SIZE: {
    XS: '0.75rem', // 12px
    SM: '0.875rem', // 14px
    BASE: '1rem', // 16px
    LG: '1.125rem', // 18px
    XL: '1.25rem', // 20px
    '2XL': '1.5rem', // 24px
    '3XL': '1.875rem', // 30px
    '4XL': '2.25rem', // 36px
  },

  FONT_WEIGHT: {
    NORMAL: 400,
    MEDIUM: 500,
    SEMIBOLD: 600,
    BOLD: 700,
  },
} as const;

// ===== 간격 시스템 =====
export const SPACING = {
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
} as const;

// ===== 그림자 시스템 =====
export const SHADOWS = {
  SM: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  BASE: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  MD: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  LG: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  XL: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

// ===== 둥근 모서리 =====
export const BORDER_RADIUS = {
  SM: '0.375rem', // 6px
  BASE: '0.25rem', // 4px
  MD: '0.5rem', // 8px
  LG: '0.75rem', // 12px
  XL: '1rem', // 16px
  FULL: '9999px',
} as const;

// ===== Z-인덱스 레이어 =====
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  OVERLAY: 1040,
  MODAL: 1050,
  TOAST: 1080,
  TOOLTIP: 1090,
} as const;

// ===== 브레이크포인트 =====
export const BREAKPOINTS = {
  XS: '0px',
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const;

// 브레이크포인트 타입 export
export type BreakpointKey = keyof typeof BREAKPOINTS;

// ===== 한국어 특화 설정 =====
export const KOREAN_DESIGN = {
  // 모바일 터치 최적화
  TOUCH_TARGET: {
    MIN_SIZE: '44px',
    COMFORTABLE_SIZE: '48px',
  },

  // 한글 줄간격 (영문보다 약간 넓게)
  LINE_HEIGHT: {
    TIGHT: 1.4,
    NORMAL: 1.6,
    RELAXED: 1.8,
  },
} as const;
