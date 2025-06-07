// 라우트
export * from './route';

// 사용자 관련
export * from './user';

// 서비스 관련
export * from './service';

// 상태 관련
export * from './status';

// 지역 관련
export * from './region';

// 게시판 관련
export * from './board';

// API 관련
export * from './api';

// 스토리지 관련
export * from './storage';

// 유효성 검사 관련
export * from './validation';

// 메시지 관련
export * from './message';

// ===== 추가 설정 상수 =====

// 페이지네이션 기본값
export const PAGINATION_DEFAULTS = {
  PAGE: 0,
  SIZE: 10,
  SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// 애니메이션 지속시간 (ms)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// 지연시간 (ms)
export const DEBOUNCE_DELAY = {
  SEARCH: 300,
  RESIZE: 100,
  SCROLL: 50,
} as const;

// 반응형 브레이크포인트
export const BREAKPOINTS = {
  SM: 640, // Small devices
  MD: 768, // Medium devices
  LG: 1024, // Large devices
  XL: 1280, // Extra large devices
  '2XL': 1536, // 2X Extra large devices
} as const;

// 테마 설정
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// 언어 설정
export const LANGUAGES = {
  KO: 'ko',
  EN: 'en',
} as const;

// 애플리케이션 메타 정보
export const APP_INFO = {
  NAME: 'MaidLab',
  VERSION: '1.0.0',
  DESCRIPTION: '가사도우미 및 돌봄서비스 플랫폼',
  AUTHOR: 'MaidLab Team',
  CONTACT_EMAIL: 'support@maidlab.com',
  COMPANY: 'MaidLab Inc.',
} as const;
