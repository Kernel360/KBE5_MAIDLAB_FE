// 앱 전역 스토리지 키
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_TYPE: 'userType',
  USER_INFO: 'userInfo',
  REMEMBER_LOGIN: 'rememberLogin',
  LANGUAGE: 'language',
  THEME: 'theme',
  RECENT_SEARCHES: 'recentSearches',
  NOTIFICATION_SETTINGS: 'notificationSettings',
  SAVED_LOGIN_INFO: 'savedLoginInfo',
} as const;

// ===== S3 관련 설정 =====
export const S3_CONFIG = {
  CLOUDFRONT_DOMAIN: 'https://d1llec2m3tvk5i.cloudfront.net',
} as const;

// 어드민 등 도메인별 스토리지 키
export const LOCAL_STORAGE_KEYS = {
  ADMIN_USER_TAB: 'adminUserTab',
  ADMIN_MANAGER_STATUS: 'adminManagerStatus',
} as const;

// ===== 세션스토리지 키 상수 =====
export const SESSION_KEYS = {
  FORM_DATA: 'formData',
  RESERVATION_DRAFT: 'reservationDraft',
  SEARCH_FILTERS: 'searchFilters',
  CURRENT_STEP: 'currentStep',
} as const;

// ===== 쿠키 키 상수 =====
export const COOKIE_KEYS = {
  REFRESH_TOKEN: 'refreshToken',
  USER_PREFERENCES: 'userPreferences',
  ANALYTICS_ID: 'analyticsId',
} as const;

// ===== 스토리지 만료 시간 (밀리초) =====
export const STORAGE_EXPIRY = {
  ACCESS_TOKEN: 1000 * 60 * 60, // 1시간
  REFRESH_TOKEN: 1000 * 60 * 60 * 24 * 7, // 7일
  USER_INFO: 1000 * 60 * 60 * 24, // 1일
  RECENT_SEARCHES: 1000 * 60 * 60 * 24 * 30, // 30일
  FORM_DATA: 1000 * 60 * 30, // 30분
} as const;
