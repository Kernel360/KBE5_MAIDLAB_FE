// API 엔드포인트
export const API_ENDPOINTS = {
  BASE_URL: 'http://localhost:3000',
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
  },
} as const;

// 라우트 경로
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
} as const;

// 페이지네이션
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_PAGE: 1,
} as const;
