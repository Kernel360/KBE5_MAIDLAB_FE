/**
 * 애플리케이션 설정 상수들
 */

// S3 & CloudFront 설정
export const S3_CONFIG = {
  CLOUDFRONT_DOMAIN: 'https://d1llec2m3tvk5i.cloudfront.net',
} as const;

// OAuth 설정
export const OAUTH_CONFIG = {
  POPUP_WIDTH: 500,
  POPUP_HEIGHT: 600,
  TIMEOUT_MS: 15 * 60 * 1000, // 15분
  FAST_POLL_INTERVAL: 500,
  SLOW_POLL_INTERVAL: 3000,
  FAST_POLL_DURATION: 30000, // 30초
} as const;

// 인증 설정
export const AUTH_CONFIG = {
  TOKEN_EXPIRY_WARNING_MINUTES: 5,
  AUTO_LOGOUT_TIMEOUT_MINUTES: 30,
  PASSWORD_MIN_LENGTH: 8,
} as const;

// 비즈니스 룰 설정
export const BUSINESS_CONFIG = {
  ROOM_SIZES: [
    { key: 'STUDIO', label: '원룸/스튜디오', basePrice: 50000 },
    { key: 'ONE_ROOM', label: '1.5룸', basePrice: 60000 },
    { key: 'TWO_ROOM', label: '2룸', basePrice: 70000 },
    { key: 'THREE_ROOM', label: '3룸', basePrice: 80000 },
    { key: 'FOUR_PLUS_ROOM', label: '4룸 이상', basePrice: 100000 },
  ],
  SERVICE_HOURS: {
    START: 9,
    END: 18,
  },
  MAX_FILE_SIZE_MB: 10,
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  SUPPORTED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
} as const;

// UI 설정
export const UI_CONFIG = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: 200,
} as const;