/**
 * 토스트 타입 상수
 */
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

/**
 * 토스트 타입 배열 (유효성 검사용)
 */
export const TOAST_TYPE_VALUES = Object.values(TOAST_TYPES);

/**
 * 토스트 위치 상수
 */
export const TOAST_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center',
} as const;

/**
 * 토스트 위치 배열
 */
export const TOAST_POSITION_VALUES = Object.values(TOAST_POSITIONS);

/**
 * 토스트 기본 설정
 */
export const TOAST_DEFAULTS = {
  DURATION: 3000, // 기본 지속 시간 (3초)
  MAX_TOASTS: 5, // 최대 토스트 개수
  DUPLICATE_THRESHOLD: 5000, // 중복 방지 시간 (5초)
  PERSISTENT_DURATION: 0, // 영구 지속 (수동 제거)
} as const;

/**
 * 토스트 메모리 관리 설정
 */
export const TOAST_MEMORY_CONFIG = {
  CLEANUP_INTERVAL: 5000, // 정리 작업 주기 (5초)
  EXPIRY_TIME: 10000, // 만료 시간 (10초)
  MAX_CACHE_SIZE: 100, // 최대 캐시 크기
  CLEANUP_BATCH_SIZE: 50, // 한 번에 정리할 항목 수
} as const;

/**
 * 토스트 ID 생성 설정
 */
export const TOAST_ID_CONFIG = {
  LENGTH: 12, // ID 길이
  CHARSET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
} as const;

/**
 * 개발 모드 설정
 */
export const TOAST_DEV_CONFIG = {
  ENABLE_LOGGING: true, // 로깅 활성화
  ENABLE_STATS: true, // 통계 수집 활성화
  GLOBAL_FUNCTIONS: true, // 전역 함수 등록
} as const;

/**
 * 토스트 로그 이모지
 */
export const TOAST_LOG_EMOJIS = {
  [TOAST_TYPES.SUCCESS]: '✅',
  [TOAST_TYPES.ERROR]: '❌',
  [TOAST_TYPES.WARNING]: '⚠️',
  [TOAST_TYPES.INFO]: 'ℹ️',
  CREATED: '🍞',
  BLOCKED: '🚫',
  REMOVED: '🗑️',
  CLEARED: '🧹',
} as const;

/**
 * 토스트 Promise 상태
 */
export const TOAST_PROMISE_STATES = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

/**
 * 기본 Promise 메시지
 */
export const DEFAULT_PROMISE_MESSAGES = {
  LOADING: '처리 중...',
  SUCCESS: '완료되었습니다.',
  ERROR: '오류가 발생했습니다.',
} as const;

/**
 * 토스트 검증 메시지
 */
export const TOAST_VALIDATION_MESSAGES = {
  INVALID_MESSAGE: 'showToast: 유효하지 않은 메시지',
  INVALID_ID: 'removeToast: 유효하지 않은 토스트 ID',
  MANAGER_NOT_INITIALIZED: 'ToastManager가 초기화되지 않았습니다.',
  INVALID_TYPE: '유효하지 않은 토스트 타입입니다.',
  INVALID_POSITION: '유효하지 않은 토스트 위치입니다.',
} as const;

/**
 * 개발 도구 함수명
 */
export const TOAST_DEV_FUNCTIONS = {
  STATS: '__toastStats',
  CLEAR_ALL: '__clearAllToasts',
  TEST_TOAST: '__testToast',
} as const;

/**
 * 토스트 테스트 메시지
 */
export const TOAST_TEST_MESSAGES = {
  [TOAST_TYPES.SUCCESS]: '테스트 성공 메시지',
  [TOAST_TYPES.ERROR]: '테스트 에러 메시지',
  [TOAST_TYPES.WARNING]: '테스트 경고 메시지',
  [TOAST_TYPES.INFO]: '테스트 정보 메시지',
} as const;
