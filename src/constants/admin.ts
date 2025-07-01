// constants/admin.ts

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

// 사용자 타입
export const USER_TYPES = {
  CONSUMER: 'consumer',
  MANAGER: 'manager',
} as const;

// 탭 인덱스
export const TAB_INDICES = {
  CONSUMER: 0,
  MANAGER: 1,
} as const;


// 게시판 타입별 한글 이름
export const BOARD_TYPE_NAMES: Record<string, string> = {
  REFUND: '환불 문의',
  MANAGER: '매니저 문의',
  SERVICE: '서비스 문의',
  ETC: '기타 문의',
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

// 서비스 타입별 한글 이름 (관리자용)
export const SERVICE_TYPE_NAMES: Record<string, string> = {
  BABYSITTER: '베이비시터',
  CARE: '돌봄 서비스',
  GENERAL_CLEANING: '일반청소',
  HOUSEKEEPING: '가사 서비스',
  PET_CARE: '반려동물 케어',
} as const;

// 서비스 타입을 한글로 변환하는 함수
export const getServiceTypeName = (serviceType: string): string => {
  return SERVICE_TYPE_NAMES[serviceType] || serviceType;
};

