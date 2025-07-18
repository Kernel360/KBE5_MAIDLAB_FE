// ===== 예약/매칭 상태 상수 =====
export const RESERVATION_STATUS = {
  PENDING: 'PENDING', // 대기중
  APPROVED: 'APPROVED', // 승인됨
  REJECTED: 'REJECTED', // 거절됨
  MATCHED: 'MATCHED', // 매칭됨 (미결제)
  PAID: 'PAID', // 결제완료
  WORKING: 'WORKING', // 진행중
  CANCELED: 'CANCELED', // 취소됨
  FAILURE: 'FAILURE', // 실패
  COMPLETED: 'COMPLETED', // 완료
} as const;

export type ReservationStatus =
  (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];

// ===== 예약 상태 한글명 =====
export const RESERVATION_STATUS_LABELS = {
  [RESERVATION_STATUS.PENDING]: '매니저 매칭 대기중',
  [RESERVATION_STATUS.APPROVED]: '승인됨',
  [RESERVATION_STATUS.REJECTED]: '거절됨',
  [RESERVATION_STATUS.MATCHED]: '매칭됨',
  [RESERVATION_STATUS.PAID]: '결제완료',
  [RESERVATION_STATUS.WORKING]: '진행중',
  [RESERVATION_STATUS.CANCELED]: '취소됨',
  [RESERVATION_STATUS.FAILURE]: '실패',
  [RESERVATION_STATUS.COMPLETED]: '완료',
} as const;

// ===== 예약 상태별 색상 =====
export const RESERVATION_STATUS_COLORS = {
  [RESERVATION_STATUS.PENDING]: '#FFA500', // 주황색
  [RESERVATION_STATUS.APPROVED]: '#4CAF50', // 초록색
  [RESERVATION_STATUS.REJECTED]: '#F44336', // 빨간색
  [RESERVATION_STATUS.MATCHED]: '#2196F3', // 파란색
  [RESERVATION_STATUS.PAID]: '#00BFA5', // 청록색
  [RESERVATION_STATUS.WORKING]: '#FF9800', // 주황색
  [RESERVATION_STATUS.CANCELED]: '#757575', // 회색
  [RESERVATION_STATUS.FAILURE]: '#F44336', // 빨간색
  [RESERVATION_STATUS.COMPLETED]: '#4CAF50', // 초록색
} as const;

// ===== 매니저 승인 상태 =====
export const MANAGER_VERIFICATION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type ManagerVerificationStatus =
  (typeof MANAGER_VERIFICATION_STATUS)[keyof typeof MANAGER_VERIFICATION_STATUS];

// ===== 매니저 승인 상태 한글명 =====
export const MANAGER_VERIFICATION_LABELS = {
  [MANAGER_VERIFICATION_STATUS.PENDING]: '검토중',
  [MANAGER_VERIFICATION_STATUS.APPROVED]: '승인됨',
  [MANAGER_VERIFICATION_STATUS.REJECTED]: '거절됨',
} as const;

// 상태 필터 옵션
export const STATUS_FILTER_OPTIONS = {
  APPROVED: 'APPROVED',
  ALL: 'ALL',
} as const;

// ===== 정산 상태 =====
export const SETTLEMENT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type SettlementStatus =
  (typeof SETTLEMENT_STATUS)[keyof typeof SETTLEMENT_STATUS];

// ===== 소비자 필터 상태 =====
export const CONSUMER_FILTER_STATUS = {
  ALL: 'ALL',
  ACTIVE: 'ACTIVE',
  DELETED: 'DELETED',
} as const;

export type ConsumerFilterStatus =
  (typeof CONSUMER_FILTER_STATUS)[keyof typeof CONSUMER_FILTER_STATUS];

// ===== 소비자 필터 상태 한글명 =====
export const CONSUMER_FILTER_LABELS = {
  [CONSUMER_FILTER_STATUS.ALL]: '전체',
  [CONSUMER_FILTER_STATUS.ACTIVE]: '활성 계정',
  [CONSUMER_FILTER_STATUS.DELETED]: '삭제된 계정',
} as const;
