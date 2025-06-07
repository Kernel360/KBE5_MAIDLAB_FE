// ===== 게시판 타입 상수 =====
export const BOARD_TYPES = {
  REFUND: 'REFUND', // 환불
  MANAGER: 'MANAGER', // 매니저
  SERVICE: 'SERVICE', // 서비스
  ETC: 'ETC', // 기타
} as const;

export type BoardType = (typeof BOARD_TYPES)[keyof typeof BOARD_TYPES];

// ===== 게시판 타입 한글명 =====
export const BOARD_TYPE_LABELS = {
  [BOARD_TYPES.REFUND]: '환불 문의',
  [BOARD_TYPES.MANAGER]: '매니저 문의',
  [BOARD_TYPES.SERVICE]: '서비스 문의',
  [BOARD_TYPES.ETC]: '기타 문의',
} as const;

// ===== 게시판 타입 설명 =====
export const BOARD_TYPE_DESCRIPTIONS = {
  [BOARD_TYPES.REFUND]: '결제 취소 및 환불에 관한 문의',
  [BOARD_TYPES.MANAGER]: '매니저 서비스에 대한 문의',
  [BOARD_TYPES.SERVICE]: '서비스 이용에 대한 문의',
  [BOARD_TYPES.ETC]: '기타 문의사항',
} as const;

// ===== 게시판 타입별 아이콘 =====
export const BOARD_TYPE_ICONS = {
  [BOARD_TYPES.REFUND]: '💰',
  [BOARD_TYPES.MANAGER]: '👥',
  [BOARD_TYPES.SERVICE]: '🛠️',
  [BOARD_TYPES.ETC]: '❓',
} as const;
