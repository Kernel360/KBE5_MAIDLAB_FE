// ===== API 응답 코드 상수 =====
export const API_CODES = {
  SUCCESS: 'SU', // 성공
  VALIDATION_FAILED: 'VF', // 유효성 검사 실패
  AUTHORIZATION_FAILED: 'AF', // 인증 실패
  LOGIN_FAILED: 'LF', // 로그인 실패
  DATABASE_ERROR: 'DBE', // 데이터베이스 오류
  DUPLICATE_TEL_NUMBER: 'DT', // 중복 전화번호
  DUPLICATE_RESERVATION: 'DR', // 중복 예약
  WRONG_ADDRESS: 'WR', // 잘못된 주소
  NO_PERMISSION: 'NP', // 권한 없음
  NOT_FOUND: 'NR', // 찾을 수 없음
  ALREADY_WORKING_OR_COMPLETED: 'AWC', // 이미 진행중이거나 완료됨
  ALREADY_CHECKED: 'AC', // 이미 체크됨
  ACCOUNT_DELETED: 'AD', // 계정 삭제됨
  INVALID_REFRESH_TOKEN: 'RF', // 유효하지 않은 리프레시 토큰
} as const;

export type ApiCode = (typeof API_CODES)[keyof typeof API_CODES];

// ===== API 코드별 한글 메시지 =====
export const API_CODE_MESSAGES = {
  [API_CODES.SUCCESS]: '성공',
  [API_CODES.VALIDATION_FAILED]: '입력값 검증에 실패했습니다.',
  [API_CODES.AUTHORIZATION_FAILED]: '인증에 실패했습니다.',
  [API_CODES.LOGIN_FAILED]: '로그인에 실패했습니다.',
  [API_CODES.DATABASE_ERROR]: '데이터베이스 오류가 발생했습니다.',
  [API_CODES.DUPLICATE_TEL_NUMBER]: '이미 사용중인 전화번호입니다.',
  [API_CODES.DUPLICATE_RESERVATION]: '중복된 예약입니다.',
  [API_CODES.WRONG_ADDRESS]: '올바르지 않은 주소입니다.',
  [API_CODES.NO_PERMISSION]: '권한이 없습니다.',
  [API_CODES.NOT_FOUND]: '요청한 정보를 찾을 수 없습니다.',
  [API_CODES.ALREADY_WORKING_OR_COMPLETED]:
    '이미 진행중이거나 완료된 작업입니다.',
  [API_CODES.ALREADY_CHECKED]: '이미 처리된 상태입니다.',
  [API_CODES.ACCOUNT_DELETED]: '삭제된 계정입니다.',
  [API_CODES.INVALID_REFRESH_TOKEN]: '유효하지 않은 토큰입니다.',
} as const;

// ===== HTTP 상태 코드 =====
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// ===== API 기본 설정 =====
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  TIMEOUT: 10000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
} as const;

// ===== API 엔드포인트 (개선된 버전) =====
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/sign-up',
    SOCIAL_LOGIN: '/api/auth/social-login',
    SOCIAL_SIGNUP: '/api/auth/social-sign-up',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    CHANGE_PASSWORD: '/api/auth/change-password',
    WITHDRAW: '/api/auth/withdraw',
  },
  MANAGER: {
    PROFILE: '/api/manager/profile',
    MYPAGE: '/api/manager/mypage',
    REVIEWS: '/api/manager/myReviews',
  },
  CONSUMER: {
    PROFILE: '/api/consumers/profile',
    MYPAGE: '/api/consumers/mypage',
    LIKES: '/api/consumers/likes',
    BLACKLIST: '/api/consumers/blacklists',
    PREFERENCE: (uuid: string) => `/api/consumers/preference/${uuid}`,
    REMOVE_PREFERENCE: (uuid: string) => `/api/consumers/preference/${uuid}`,
  },
  RESERVATION: {
    CREATE: '/api/reservations/register',
    LIST: '/api/reservations',
    MANAGER: '/api/reservations/manager',
    DETAIL: (id: number) => `/api/reservations/${id}`,
    CANCEL: (id: number) => `/api/reservations/${id}/cancel`,
    PRICE_CHECK: '/api/reservations/price',
    PAYMENT: () => `/api/reservations/payment`,
    RESPONSE: (id: number) => `/api/reservations/${id}/response`,
    CHECKIN: (id: number) => `/api/reservations/${id}/checkin`,
    CHECKOUT: (id: number) => `/api/reservations/${id}/checkout`,
    REVIEW: () => '/api/reservations/review',
    SETTLEMENTS: '/api/reservations/settlements/weekly-details',
  },
  MATCHING: {
    MANAGERS: '/api/matching/matchmanager',
    START: '/api/matching/matchstart',
    LIST: '/api/matching',
  },
  EVENT: {
    LIST: '/api/events',
    DETAIL: (id: number) => `/api/event/${id}`,
    CREATE: '/api/admin/event',
    UPDATE: (id: number) => `/api/admin/event/${id}`,
    DELETE: (id: number) => `/api/admin/event/${id}`,
    GETCOUNT: `/api/eventcount`,
  },
  BOARD: {
    LIST: '/api/board',
    DETAIL: (id: number) => `/api/board/${id}`,
    CREATE: '/api/board',
    UPDATE: (id: number) => `/api/board/${id}`,
    DELETE: (id: number) => `/api/board/${id}`,
  },
  FILE: {
    PRESIGNED_URLS: '/api/files/presigned-urls',
  },
  ADMIN: {
    AUTH: {
      LOGIN: '/api/admin/auth/login',
      REFRESH: '/api/admin/auth/refresh',
      LOGOUT: '/api/admin/auth/logout',
    },
    MANAGER: {
      LIST: '/api/admin/manager',
      DETAIL: (id: number) => `/api/admin/manager/${id}`,
      APPROVE: (id: number) => `/api/admin/manager/${id}/approve`,
      REJECT: (id: number) => `/api/admin/manager/${id}/reject`,
      STATUS: '/api/admin/manager/status',
      GETCOUNT: '/api/admin/manager/managercount',
      NEWMANAGERCOUNT: '/api/admin/manager/newmanagercount',
    },
    CONSUMER: {
      LIST: '/api/admin/consumer',
      DETAIL: (id: number) => `/api/admin/consumer/${id}`,
      GETCOUNT: '/api/admin/consumer/consumercount',
    },
    RESERVATION: {
      LIST: '/api/admin/reservations',
      DETAIL: (id: number) => `/api/admin/reservations/${id}`,
      DAILY: '/api/admin/reservations/date',
      SETTLEMENTS: '/api/admin/reservations/settlements/weekly',
      SETTLEMENT_DETAIL: (id: number) =>
        `/api/admin/reservations/settlement/${id}`,
      SETTLEMENT_APPROVE: (id: number) =>
        `/api/admin/reservations/settlement/${id}/approve`,
      SETTLEMENT_REJECT: (id: number) =>
        `/api/admin/reservations/settlement/${id}/reject`,
      GETTODAYCOUNT: '/api/admin/reservations/todayreservation',
      CONSUMER: (id: number) => `/api/admin/reservations/consumer/${id}`,
      MANAGER: (id: number) => `/api/admin/reservations/manager/${id}`,
    },
    MATCHING: {
      LIST: '/api/admin/matching',
      STATUS: '/api/admin/matching/status',
      CHANGE_MANAGER: '/api/admin/matching/managerchange',
    },
    BOARD: {
      LIST: '/api/admin/board',
      DETAIL: (id: number) => `/api/admin/board/${id}`,
      CONSULTATION: '/api/admin/board/consultation',
      REFUND: '/api/admin/board/refund',
      UPDATE_ANSWER: (id: number) => `/api/admin/board/answer/${id}`,
      GETWITHOUTANSWERCOUNT: '/api/admin/board/boardcount',
    },
  },
} as const;

// ===== 편의 함수들 =====

/**
 * API 코드에 해당하는 한글 메시지를 반환
 */
export const getApiMessage = (code: ApiCode): string => {
  return API_CODE_MESSAGES[code];
};

/**
 * HTTP 상태 코드가 성공 범위인지 확인
 */
export const isSuccessStatus = (status: number): boolean => {
  return status >= 200 && status < 300;
};

/**
 * HTTP 상태 코드가 클라이언트 에러인지 확인
 */
export const isClientError = (status: number): boolean => {
  return status >= 400 && status < 500;
};

/**
 * HTTP 상태 코드가 서버 에러인지 확인
 */
export const isServerError = (status: number): boolean => {
  return status >= 500;
};
