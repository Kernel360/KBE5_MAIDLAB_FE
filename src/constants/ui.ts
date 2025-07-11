// 페이지네이션 기본값
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_NUMBER = 0;
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

// 언어 설정
export const LANGUAGES = {
  KO: 'ko',
  EN: 'en',
} as const;

export type LanguageType = (typeof LANGUAGES)[keyof typeof LANGUAGES];

// 애플리케이션 메타 정보
export const APP_INFO = {
  NAME: 'MaidLab',
  VERSION: '1.0.0',
  DESCRIPTION: '가사도우미 및 돌봄서비스 플랫폼',
  AUTHOR: 'MaidLab Team',
  CONTACT_EMAIL: 'support@maidlab.com',
  COMPANY: 'MaidLab Inc.',
} as const;

// 테이블 컬럼 수
export const TABLE_COLUMNS = {
  CONSUMER: 4,
  MANAGER: 4,
} as const;

// 탭 인덱스
export const TAB_INDICES = {
  CONSUMER: 0,
  MANAGER: 1,
} as const;

// ===== 버튼 텍스트 =====
export const BUTTON_TEXTS = {
  // 기본 액션
  SAVE: '저장',
  CANCEL: '취소',
  DELETE: '삭제',
  EDIT: '수정',
  CREATE: '생성',
  UPDATE: '업데이트',
  SUBMIT: '제출',
  RESET: '초기화',

  // 인증
  LOGIN: '로그인',
  LOGOUT: '로그아웃',
  SIGNUP: '회원가입',

  // 예약
  RESERVE: '예약하기',
  CANCEL_RESERVATION: '예약 취소',
  APPROVE: '승인',
  REJECT: '거절',

  // 찜하기/블랙리스트
  LIKE: '찜하기',
  UNLIKE: '찜 해제',
  BLACKLIST: '블랙리스트',

  // 리뷰
  WRITE_REVIEW: '리뷰 작성',
  SUBMIT_REVIEW: '리뷰 제출',

  // 네비게이션
  BACK: '뒤로',
  NEXT: '다음',
  PREVIOUS: '이전',
  HOME: '홈',

  // 검색/필터
  SEARCH: '검색',
  FILTER: '필터',
  RESET_FILTER: '필터 초기화',

  // 파일
  UPLOAD: '업로드',
  DOWNLOAD: '다운로드',

  // 기타
  CONFIRM: '확인',
  CLOSE: '닫기',
  VIEW_MORE: '더보기',
  REFRESH: '새로고침',
} as const;

// ===== UI 설정 =====
export const UI_CONFIG = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: 200,
} as const;

// ===== Breakpoints =====
export const BREAKPOINTS = {
  XS: 0,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;
