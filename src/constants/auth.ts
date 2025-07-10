/**
 * OAuth 관련 설정 상수
 */
export const OAUTH_CONFIG = {
  POPUP_WIDTH: 500,
  POPUP_HEIGHT: 600,
  TIMEOUT_MS: 15 * 60 * 1000, // 15분
  FAST_POLL_INTERVAL: 500,
  SLOW_POLL_INTERVAL: 3000,
  FAST_POLL_DURATION: 30000, // 30초
} as const;

/**
 * 인증 관련 일반 설정 상수
 */
export const AUTH_CONFIG = {
  TOKEN_EXPIRY_WARNING_MINUTES: 5,
  AUTO_LOGOUT_TIMEOUT_MINUTES: 30,
  PASSWORD_MIN_LENGTH: 8,
} as const;

/**
 * OAuth 팝업 기본 설정
 */
export const DEFAULT_POPUP_CONFIG = {
  width: OAUTH_CONFIG.POPUP_WIDTH,
  height: OAUTH_CONFIG.POPUP_HEIGHT,
  timeout: OAUTH_CONFIG.TIMEOUT_MS,
  fastPollInterval: OAUTH_CONFIG.FAST_POLL_INTERVAL,
  slowPollInterval: OAUTH_CONFIG.SLOW_POLL_INTERVAL,
  fastPollDuration: OAUTH_CONFIG.FAST_POLL_DURATION,
} as const;
