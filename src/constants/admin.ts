// 페이지네이션 기본값
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_NUMBER = 0;

// 로컬 스토리지 키
export const LOCAL_STORAGE_KEYS = {
  ADMIN_USER_TAB: 'adminUserTab',
  ADMIN_MANAGER_STATUS: 'adminManagerStatus',
} as const;

// 테이블 컬럼 수
export const TABLE_COLUMNS = {
  CONSUMER: 4,
  MANAGER: 4,
} as const;

// 상태 필터 옵션
export const STATUS_FILTER_OPTIONS = {
  APPROVED: 'APPROVED',
  ALL: 'ALL',
} as const;

// 탭 인덱스
export const TAB_INDICES = {
  CONSUMER: 0,
  MANAGER: 1,
} as const;

// 게시판 타입별 칩 색상
export const BOARD_TYPE_COLORS: Record<
  string,
  'error' | 'primary' | 'info' | 'default'
> = {
  REFUND: 'error',
  MANAGER: 'primary',
  SERVICE: 'info',
  ETC: 'default',
} as const;
