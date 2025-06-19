// ===== 테마 타입 =====
export const THEME_TYPES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export type ThemeType = (typeof THEME_TYPES)[keyof typeof THEME_TYPES];

// ===== 색상 팔레트 =====
export const COLORS = {
  // 주요 브랜드 컬러 (오렌지 계열)
  PRIMARY: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316', // 메인 브랜드 컬러 (CSS와 일치)
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },

  // 보조 컬러 (회색 계열로 변경)
  SECONDARY: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280', // CSS --color-secondary와 일치
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // 회색 계열 (CSS와 일치)
  GRAY: {
    50: '#F9FAFB', // CSS --color-gray-50과 일치
    100: '#F3F4F6', // CSS --color-gray-100과 일치
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827', // CSS --color-gray-900와 일치
  },

  // 상태 컬러
  SUCCESS: {
    50: '#E8F5E8',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // 성공 메인 컬러
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },

  WARNING: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107', // 경고 메인 컬러
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
  },

  ERROR: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336', // 에러 메인 컬러
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },

  INFO: {
    50: '#E1F5FE',
    100: '#B3E5FC',
    200: '#81D4FA',
    300: '#4FC3F7',
    400: '#29B6F6',
    500: '#03A9F4', // 정보 메인 컬러
    600: '#039BE5',
    700: '#0288D1',
    800: '#0277BD',
    900: '#01579B',
  },
} as const;

// ===== 예약 상태별 색상 (기존 status.ts와 통합) =====
export const STATUS_COLORS = {
  PENDING: COLORS.WARNING[500],
  APPROVED: COLORS.SUCCESS[500],
  REJECTED: COLORS.ERROR[500],
  MATCHED: COLORS.INFO[500],
  WORKING: COLORS.WARNING[600],
  CANCELED: COLORS.GRAY[500],
  FAILURE: COLORS.ERROR[500],
  COMPLETED: COLORS.SUCCESS[500],
} as const;

// ===== 타이포그래피 (CSS와 일치) =====
export const TYPOGRAPHY = {
  FONT_FAMILY: {
    PRIMARY:
      "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif", // CSS와 일치
    MONOSPACE: "'Fira Code', 'Monaco', 'Consolas', monospace",
  },

  FONT_SIZE: {
    XS: '0.75rem', // 12px - CSS --text-xs와 일치
    SM: '0.875rem', // 14px - CSS --text-sm과 일치
    BASE: '1rem', // 16px - CSS --text-base와 일치
    LG: '1.125rem', // 18px - CSS --text-lg와 일치
    XL: '1.25rem', // 20px - CSS --text-xl과 일치
    '2XL': '1.5rem', // 24px
    '3XL': '1.875rem', // 30px
    '4XL': '2.25rem', // 36px
    '5XL': '3rem', // 48px
  },

  FONT_WEIGHT: {
    THIN: 100,
    LIGHT: 300,
    NORMAL: 400,
    MEDIUM: 500,
    SEMIBOLD: 600,
    BOLD: 700,
    EXTRABOLD: 800,
    BLACK: 900,
  },

  LINE_HEIGHT: {
    TIGHT: 1.25,
    SNUG: 1.375,
    NORMAL: 1.5,
    RELAXED: 1.625,
    LOOSE: 2,
  },

  LETTER_SPACING: {
    TIGHTER: '-0.05em',
    TIGHT: '-0.025em',
    NORMAL: '0em',
    WIDE: '0.025em',
    WIDER: '0.05em',
    WIDEST: '0.1em',
  },
} as const;

// ===== 간격 시스템 (CSS와 일치) =====
export const SPACING = {
  PX: '1px',
  0: '0px',
  1: '0.25rem', // 4px - CSS --spacing-xs와 일치
  2: '0.5rem', // 8px - CSS --spacing-sm과 일치
  3: '0.75rem', // 12px
  4: '1rem', // 16px - CSS --spacing-md와 일치
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px - CSS --spacing-lg와 일치
  7: '1.75rem', // 28px
  8: '2rem', // 32px - CSS --spacing-xl과 일치
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px
} as const;

// ===== 그림자 시스템 (CSS와 일치) =====
export const SHADOWS = {
  NONE: 'none',
  SM: '0 1px 2px 0 rgb(0 0 0 / 0.05)', // CSS --shadow-sm과 일치
  BASE: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  MD: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', // CSS --shadow-md와 일치
  LG: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  XL: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2XL': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  INNER: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

// ===== 둥근 모서리 (CSS와 일치) =====
export const BORDER_RADIUS = {
  NONE: '0px',
  SM: '0.375rem', // 6px - CSS --radius-sm과 일치
  BASE: '0.25rem', // 4px
  MD: '0.5rem', // 8px - CSS --radius-md와 일치
  LG: '0.75rem', // 12px - CSS --radius-lg와 일치
  XL: '1rem', // 16px - CSS --radius-xl과 일치
  '2XL': '1rem', // 16px
  '3XL': '1.5rem', // 24px
  FULL: '9999px',
} as const;

// ===== Z-인덱스 레이어 =====
export const Z_INDEX = {
  AUTO: 'auto',
  BEHIND: -1,
  BASE: 0,
  DOCKED: 10,
  DROPDOWN: 1000,
  STICKY: 1020,
  BANNER: 1030,
  OVERLAY: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  SKIPLINK: 1070,
  TOAST: 1080,
  TOOLTIP: 1090,
} as const;

// ===== 애니메이션 이징 =====
export const EASING = {
  LINEAR: 'linear',
  EASE: 'ease',
  EASE_IN: 'ease-in',
  EASE_OUT: 'ease-out',
  EASE_IN_OUT: 'ease-in-out',

  // 커스텀 베지어 곡선
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  SMOOTH: 'cubic-bezier(0.4, 0, 0.2, 1)',
  SWIFT: 'cubic-bezier(0.4, 0, 0.6, 1)',
  SHARP: 'cubic-bezier(0.4, 0, 1, 1)',
} as const;

// ===== 애니메이션 지속시간 (CSS와 일치) =====
export const DURATION = {
  INSTANT: '0ms',
  FAST: '150ms', // CSS --transition-fast와 일치
  NORMAL: '300ms', // CSS --transition-normal과 일치
  SLOW: '500ms', // CSS --transition-slow와 일치
  SLOWER: '750ms',
  SLOWEST: '1000ms',
} as const;

// ✅ 브레이크포인트 통합 관리 (ui.ts와 중복 제거)
export const BREAKPOINTS = {
  XS: '0px',
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const;

// ===== 컴포넌트별 테마 (CSS와 일치) =====
export const COMPONENT_THEMES = {
  BUTTON: {
    PRIMARY: {
      BACKGROUND: COLORS.PRIMARY[500], // #F97316 (오렌지)
      BACKGROUND_HOVER: COLORS.PRIMARY[600], // #EA580C
      BACKGROUND_ACTIVE: COLORS.PRIMARY[700], // #C2410C
      COLOR: '#FFFFFF',
      BORDER: COLORS.PRIMARY[500],
    },
    SECONDARY: {
      BACKGROUND: COLORS.GRAY[200], // CSS .btn-secondary와 일치
      BACKGROUND_HOVER: COLORS.GRAY[300],
      BACKGROUND_ACTIVE: COLORS.GRAY[400],
      COLOR: COLORS.GRAY[700], // CSS text-gray-700과 일치
      BORDER: COLORS.GRAY[200],
    },
    OUTLINE: {
      BACKGROUND: 'transparent',
      BACKGROUND_HOVER: COLORS.PRIMARY[500],
      BACKGROUND_ACTIVE: COLORS.PRIMARY[600],
      COLOR: COLORS.PRIMARY[500],
      COLOR_HOVER: '#FFFFFF',
      BORDER: COLORS.PRIMARY[500],
    },
    GHOST: {
      BACKGROUND: 'transparent',
      BACKGROUND_HOVER: COLORS.GRAY[100],
      BACKGROUND_ACTIVE: COLORS.GRAY[200],
      COLOR: COLORS.GRAY[700],
      BORDER: 'transparent',
    },
  },

  INPUT: {
    BACKGROUND: '#FFFFFF',
    BORDER: COLORS.GRAY[300], // CSS border-gray-300과 일치
    BORDER_FOCUS: COLORS.PRIMARY[500], // CSS focus:ring-orange-500와 일치
    BORDER_ERROR: COLORS.ERROR[500], // CSS focus:ring-red-500와 일치
    COLOR: COLORS.GRAY[900],
    PLACEHOLDER: COLORS.GRAY[500],
  },

  CARD: {
    BACKGROUND: '#FFFFFF', // CSS .card와 일치
    BORDER: COLORS.GRAY[200], // CSS border-gray-200와 일치
    SHADOW: SHADOWS.SM, // CSS shadow-sm과 일치
    SHADOW_HOVER: SHADOWS.MD,
  },

  MODAL: {
    BACKGROUND: '#FFFFFF',
    OVERLAY: 'rgba(0, 0, 0, 0.5)',
    SHADOW: SHADOWS['2XL'],
  },

  TOAST: {
    SUCCESS: {
      BACKGROUND: COLORS.SUCCESS[50],
      BORDER: COLORS.SUCCESS[200],
      COLOR: COLORS.SUCCESS[800],
      ICON: COLORS.SUCCESS[500],
    },
    WARNING: {
      BACKGROUND: COLORS.WARNING[50],
      BORDER: COLORS.WARNING[200],
      COLOR: COLORS.WARNING[800],
      ICON: COLORS.WARNING[500],
    },
    ERROR: {
      BACKGROUND: COLORS.ERROR[50],
      BORDER: COLORS.ERROR[200],
      COLOR: COLORS.ERROR[800],
      ICON: COLORS.ERROR[500],
    },
    INFO: {
      BACKGROUND: COLORS.INFO[50],
      BORDER: COLORS.INFO[200],
      COLOR: COLORS.INFO[800],
      ICON: COLORS.INFO[500],
    },
  },
} as const;

// ===== 다크 테마 색상 (향후 확장용) =====
export const DARK_COLORS = {
  BACKGROUND: {
    PRIMARY: '#111827', // CSS [data-theme='dark'] --color-background와 일치
    SECONDARY: '#1F2937',
    TERTIARY: '#374151',
  },

  TEXT: {
    PRIMARY: '#F9FAFB', // CSS [data-theme='dark'] --color-text와 일치
    SECONDARY: '#D1D5DB',
    TERTIARY: '#9CA3AF',
  },

  SURFACE: {
    ELEVATED: '#1F2937',
    OVERLAY: '#374151', // CSS [data-theme='dark'] --color-border와 일치
  },
} as const;

// ===== 한국어 특화 디자인 설정 (CSS와 일치) =====
export const KOREAN_DESIGN = {
  // 한글 폰트 최적화 (CSS와 동일)
  FONT_FAMILY:
    "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif",

  // 한글 줄간격 (영문보다 약간 넓게)
  LINE_HEIGHT: {
    TIGHT: 1.4,
    NORMAL: 1.6,
    RELAXED: 1.8,
  },

  // 모바일 터치 최적화 (CSS .touch-target과 일치)
  TOUCH_TARGET: {
    MIN_SIZE: '44px', // CSS min-height: 44px와 일치
    COMFORTABLE_SIZE: '48px',
  },

  // 한국 사용자 선호 색상 (오렌지 메인)
  PREFERRED_COLORS: {
    ORANGE: COLORS.PRIMARY[500], // 메인 브랜드 (활동성, 친근함)
    GREEN: COLORS.SUCCESS[500], // 안정감
    RED: COLORS.ERROR[500], // 주의/경고
    BLUE: COLORS.INFO[500], // 신뢰감
  },
} as const;

// ===== 접근성 설정 (CSS와 일치) =====
export const ACCESSIBILITY = {
  // 색상 대비율 (WCAG 2.1 기준)
  CONTRAST_RATIOS: {
    AA_NORMAL: 4.5,
    AA_LARGE: 3,
    AAA_NORMAL: 7,
    AAA_LARGE: 4.5,
  },

  // 포커스 표시 (CSS .focus-ring과 일치)
  FOCUS: {
    OUTLINE_WIDTH: '2px',
    OUTLINE_STYLE: 'solid',
    OUTLINE_COLOR: COLORS.PRIMARY[500], // 오렌지 포커스 링
    OUTLINE_OFFSET: '2px',
  },

  // 애니메이션 감소 설정 (CSS prefers-reduced-motion과 일치)
  REDUCED_MOTION: {
    DURATION: '0.01ms',
    EASING: 'linear',
  },
} as const;
