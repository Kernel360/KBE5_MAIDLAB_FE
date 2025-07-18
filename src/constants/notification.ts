// ===== 알림 타입 상수 =====
export const NOTIFICATION_TYPES = {
  // 예약 관련
  RESERVATION_CREATED: 'RESERVATION_CREATED', // 예약 생성
  RESERVATION_APPROVED: 'RESERVATION_APPROVED', // 예약 승인
  RESERVATION_REJECTED: 'RESERVATION_REJECTED', // 예약 거절
  RESERVATION_CANCELED: 'RESERVATION_CANCELED', // 예약 취소
  RESERVATION_COMPLETED: 'RESERVATION_COMPLETED', // 예약 완료

  // 매칭 관련
  MATCHING_STARTED: 'MATCHING_STARTED', // 매칭 시작
  MATCHING_COMPLETED: 'MATCHING_COMPLETED', // 매칭 완료
  MATCHING_FAILED: 'MATCHING_FAILED', // 매칭 실패
  MANAGER_CHANGED: 'MANAGER_CHANGED', // 매니저 변경

  // 체크인/아웃
  CHECKIN_REMINDER: 'CHECKIN_REMINDER', // 체크인 알림
  CHECKOUT_REMINDER: 'CHECKOUT_REMINDER', // 체크아웃 알림
  SERVICE_STARTED: 'SERVICE_STARTED', // 서비스 시작
  SERVICE_COMPLETED: 'SERVICE_COMPLETED', // 서비스 완료

  // 결제 관련
  PAYMENT_COMPLETED: 'PAYMENT_COMPLETED', // 결제 완료
  PAYMENT_FAILED: 'PAYMENT_FAILED', // 결제 실패
  REFUND_PROCESSED: 'REFUND_PROCESSED', // 환불 처리

  // 리뷰 관련
  REVIEW_REQUESTED: 'REVIEW_REQUESTED', // 리뷰 요청
  REVIEW_RECEIVED: 'REVIEW_RECEIVED', // 리뷰 받음

  // 매니저 관련
  MANAGER_APPROVED: 'MANAGER_APPROVED', // 매니저 승인
  MANAGER_REJECTED: 'MANAGER_REJECTED', // 매니저 거절
  DOCUMENT_REQUIRED: 'DOCUMENT_REQUIRED', // 서류 제출 요청

  // 시스템 관련
  SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE', // 시스템 점검
  SYSTEM_UPDATE: 'SYSTEM_UPDATE', // 시스템 업데이트
  PROMOTION: 'PROMOTION', // 프로모션
  EVENT: 'EVENT', // 이벤트

  // 게시판 관련
  BOARD_ANSWERED: 'BOARD_ANSWERED', // 게시글 답변
  CONSULTATION_SCHEDULED: 'CONSULTATION_SCHEDULED', // 상담 예약
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

// ===== 알림 타입별 한글명 =====
export const NOTIFICATION_TYPE_LABELS = {
  [NOTIFICATION_TYPES.RESERVATION_CREATED]: '예약이 생성되었습니다',
  [NOTIFICATION_TYPES.RESERVATION_APPROVED]: '예약이 승인되었습니다',
  [NOTIFICATION_TYPES.RESERVATION_REJECTED]: '예약이 거절되었습니다',
  [NOTIFICATION_TYPES.RESERVATION_CANCELED]: '예약이 취소되었습니다',
  [NOTIFICATION_TYPES.RESERVATION_COMPLETED]: '예약이 완료되었습니다',

  [NOTIFICATION_TYPES.MATCHING_STARTED]: '매칭이 시작되었습니다',
  [NOTIFICATION_TYPES.MATCHING_COMPLETED]: '매니저 매칭이 완료되었습니다',
  [NOTIFICATION_TYPES.MATCHING_FAILED]: '매칭에 실패했습니다',
  [NOTIFICATION_TYPES.MANAGER_CHANGED]: '매니저가 변경되었습니다',

  [NOTIFICATION_TYPES.CHECKIN_REMINDER]: '체크인 시간입니다',
  [NOTIFICATION_TYPES.CHECKOUT_REMINDER]: '체크아웃 시간입니다',
  [NOTIFICATION_TYPES.SERVICE_STARTED]: '서비스가 시작되었습니다',
  [NOTIFICATION_TYPES.SERVICE_COMPLETED]: '서비스가 완료되었습니다',

  [NOTIFICATION_TYPES.PAYMENT_COMPLETED]: '결제가 완료되었습니다',
  [NOTIFICATION_TYPES.PAYMENT_FAILED]: '결제에 실패했습니다',
  [NOTIFICATION_TYPES.REFUND_PROCESSED]: '환불이 처리되었습니다',

  [NOTIFICATION_TYPES.REVIEW_REQUESTED]: '리뷰 작성을 요청합니다',
  [NOTIFICATION_TYPES.REVIEW_RECEIVED]: '새로운 리뷰가 등록되었습니다',

  [NOTIFICATION_TYPES.MANAGER_APPROVED]: '매니저 승인이 완료되었습니다',
  [NOTIFICATION_TYPES.MANAGER_REJECTED]: '매니저 승인이 거절되었습니다',
  [NOTIFICATION_TYPES.DOCUMENT_REQUIRED]: '추가 서류 제출이 필요합니다',

  [NOTIFICATION_TYPES.SYSTEM_MAINTENANCE]: '시스템 점검이 예정되어 있습니다',
  [NOTIFICATION_TYPES.SYSTEM_UPDATE]: '시스템이 업데이트되었습니다',
  [NOTIFICATION_TYPES.PROMOTION]: '새로운 프로모션이 시작되었습니다',
  [NOTIFICATION_TYPES.EVENT]: '새로운 이벤트가 시작되었습니다',

  [NOTIFICATION_TYPES.BOARD_ANSWERED]: '문의에 답변이 등록되었습니다',
  [NOTIFICATION_TYPES.CONSULTATION_SCHEDULED]: '상담이 예약되었습니다',
} as const;

// ===== 알림 우선순위 =====
export const NOTIFICATION_PRIORITY = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;

export type NotificationPriority =
  (typeof NOTIFICATION_PRIORITY)[keyof typeof NOTIFICATION_PRIORITY];

// ===== 알림 타입별 우선순위 =====
export const NOTIFICATION_TYPE_PRIORITIES = {
  [NOTIFICATION_TYPES.RESERVATION_CREATED]: NOTIFICATION_PRIORITY.MEDIUM,
  [NOTIFICATION_TYPES.RESERVATION_APPROVED]: NOTIFICATION_PRIORITY.HIGH,
  [NOTIFICATION_TYPES.RESERVATION_REJECTED]: NOTIFICATION_PRIORITY.HIGH,
  [NOTIFICATION_TYPES.RESERVATION_CANCELED]: NOTIFICATION_PRIORITY.HIGH,
  [NOTIFICATION_TYPES.RESERVATION_COMPLETED]: NOTIFICATION_PRIORITY.MEDIUM,

  [NOTIFICATION_TYPES.MATCHING_STARTED]: NOTIFICATION_PRIORITY.MEDIUM,
  [NOTIFICATION_TYPES.MATCHING_COMPLETED]: NOTIFICATION_PRIORITY.HIGH,
  [NOTIFICATION_TYPES.MATCHING_FAILED]: NOTIFICATION_PRIORITY.HIGH,
  [NOTIFICATION_TYPES.MANAGER_CHANGED]: NOTIFICATION_PRIORITY.HIGH,

  [NOTIFICATION_TYPES.CHECKIN_REMINDER]: NOTIFICATION_PRIORITY.HIGH,
  [NOTIFICATION_TYPES.CHECKOUT_REMINDER]: NOTIFICATION_PRIORITY.HIGH,
  [NOTIFICATION_TYPES.SERVICE_STARTED]: NOTIFICATION_PRIORITY.MEDIUM,
  [NOTIFICATION_TYPES.SERVICE_COMPLETED]: NOTIFICATION_PRIORITY.MEDIUM,

  [NOTIFICATION_TYPES.PAYMENT_COMPLETED]: NOTIFICATION_PRIORITY.HIGH,
  [NOTIFICATION_TYPES.PAYMENT_FAILED]: NOTIFICATION_PRIORITY.HIGH,
  [NOTIFICATION_TYPES.REFUND_PROCESSED]: NOTIFICATION_PRIORITY.MEDIUM,

  [NOTIFICATION_TYPES.REVIEW_REQUESTED]: NOTIFICATION_PRIORITY.MEDIUM,
  [NOTIFICATION_TYPES.REVIEW_RECEIVED]: NOTIFICATION_PRIORITY.MEDIUM,

  [NOTIFICATION_TYPES.MANAGER_APPROVED]: NOTIFICATION_PRIORITY.HIGH,
  [NOTIFICATION_TYPES.MANAGER_REJECTED]: NOTIFICATION_PRIORITY.HIGH,
  [NOTIFICATION_TYPES.DOCUMENT_REQUIRED]: NOTIFICATION_PRIORITY.MEDIUM,

  [NOTIFICATION_TYPES.SYSTEM_MAINTENANCE]: NOTIFICATION_PRIORITY.MEDIUM,
  [NOTIFICATION_TYPES.SYSTEM_UPDATE]: NOTIFICATION_PRIORITY.LOW,
  [NOTIFICATION_TYPES.PROMOTION]: NOTIFICATION_PRIORITY.LOW,
  [NOTIFICATION_TYPES.EVENT]: NOTIFICATION_PRIORITY.LOW,

  [NOTIFICATION_TYPES.BOARD_ANSWERED]: NOTIFICATION_PRIORITY.MEDIUM,
  [NOTIFICATION_TYPES.CONSULTATION_SCHEDULED]: NOTIFICATION_PRIORITY.MEDIUM,
} as const;

// ===== 알림 카테고리 =====
export const NOTIFICATION_CATEGORIES = {
  RESERVATION: 'RESERVATION',
  MATCHING: 'MATCHING',
  PAYMENT: 'PAYMENT',
  REVIEW: 'REVIEW',
  MANAGER: 'MANAGER',
  SYSTEM: 'SYSTEM',
  BOARD: 'BOARD',
} as const;

export type NotificationCategory =
  (typeof NOTIFICATION_CATEGORIES)[keyof typeof NOTIFICATION_CATEGORIES];

// ===== 알림 타입별 카테고리 =====
export const NOTIFICATION_TYPE_CATEGORIES = {
  [NOTIFICATION_TYPES.RESERVATION_CREATED]: NOTIFICATION_CATEGORIES.RESERVATION,
  [NOTIFICATION_TYPES.RESERVATION_APPROVED]:
    NOTIFICATION_CATEGORIES.RESERVATION,
  [NOTIFICATION_TYPES.RESERVATION_REJECTED]:
    NOTIFICATION_CATEGORIES.RESERVATION,
  [NOTIFICATION_TYPES.RESERVATION_CANCELED]:
    NOTIFICATION_CATEGORIES.RESERVATION,
  [NOTIFICATION_TYPES.RESERVATION_COMPLETED]:
    NOTIFICATION_CATEGORIES.RESERVATION,

  [NOTIFICATION_TYPES.MATCHING_STARTED]: NOTIFICATION_CATEGORIES.MATCHING,
  [NOTIFICATION_TYPES.MATCHING_COMPLETED]: NOTIFICATION_CATEGORIES.MATCHING,
  [NOTIFICATION_TYPES.MATCHING_FAILED]: NOTIFICATION_CATEGORIES.MATCHING,
  [NOTIFICATION_TYPES.MANAGER_CHANGED]: NOTIFICATION_CATEGORIES.MATCHING,

  [NOTIFICATION_TYPES.CHECKIN_REMINDER]: NOTIFICATION_CATEGORIES.RESERVATION,
  [NOTIFICATION_TYPES.CHECKOUT_REMINDER]: NOTIFICATION_CATEGORIES.RESERVATION,
  [NOTIFICATION_TYPES.SERVICE_STARTED]: NOTIFICATION_CATEGORIES.RESERVATION,
  [NOTIFICATION_TYPES.SERVICE_COMPLETED]: NOTIFICATION_CATEGORIES.RESERVATION,

  [NOTIFICATION_TYPES.PAYMENT_COMPLETED]: NOTIFICATION_CATEGORIES.PAYMENT,
  [NOTIFICATION_TYPES.PAYMENT_FAILED]: NOTIFICATION_CATEGORIES.PAYMENT,
  [NOTIFICATION_TYPES.REFUND_PROCESSED]: NOTIFICATION_CATEGORIES.PAYMENT,

  [NOTIFICATION_TYPES.REVIEW_REQUESTED]: NOTIFICATION_CATEGORIES.REVIEW,
  [NOTIFICATION_TYPES.REVIEW_RECEIVED]: NOTIFICATION_CATEGORIES.REVIEW,

  [NOTIFICATION_TYPES.MANAGER_APPROVED]: NOTIFICATION_CATEGORIES.MANAGER,
  [NOTIFICATION_TYPES.MANAGER_REJECTED]: NOTIFICATION_CATEGORIES.MANAGER,
  [NOTIFICATION_TYPES.DOCUMENT_REQUIRED]: NOTIFICATION_CATEGORIES.MANAGER,

  [NOTIFICATION_TYPES.SYSTEM_MAINTENANCE]: NOTIFICATION_CATEGORIES.SYSTEM,
  [NOTIFICATION_TYPES.SYSTEM_UPDATE]: NOTIFICATION_CATEGORIES.SYSTEM,
  [NOTIFICATION_TYPES.PROMOTION]: NOTIFICATION_CATEGORIES.SYSTEM,
  [NOTIFICATION_TYPES.EVENT]: NOTIFICATION_CATEGORIES.SYSTEM,

  [NOTIFICATION_TYPES.BOARD_ANSWERED]: NOTIFICATION_CATEGORIES.BOARD,
  [NOTIFICATION_TYPES.CONSULTATION_SCHEDULED]: NOTIFICATION_CATEGORIES.BOARD,
} as const;

// ===== 알림 설정 기본값 =====
export const NOTIFICATION_SETTINGS = {
  PUSH_ENABLED: true,
  EMAIL_ENABLED: true,
  SMS_ENABLED: false,
  SOUND_ENABLED: true,
  VIBRATION_ENABLED: true,

  // 카테고리별 기본 설정
  CATEGORIES: {
    [NOTIFICATION_CATEGORIES.RESERVATION]: {
      PUSH: true,
      EMAIL: true,
      SMS: false,
    },
    [NOTIFICATION_CATEGORIES.MATCHING]: {
      PUSH: true,
      EMAIL: true,
      SMS: false,
    },
    [NOTIFICATION_CATEGORIES.PAYMENT]: {
      PUSH: true,
      EMAIL: true,
      SMS: true, // 결제는 SMS도 기본 활성화
    },
    [NOTIFICATION_CATEGORIES.REVIEW]: {
      PUSH: true,
      EMAIL: false,
      SMS: false,
    },
    [NOTIFICATION_CATEGORIES.MANAGER]: {
      PUSH: true,
      EMAIL: true,
      SMS: false,
    },
    [NOTIFICATION_CATEGORIES.SYSTEM]: {
      PUSH: false,
      EMAIL: false,
      SMS: false,
    },
    [NOTIFICATION_CATEGORIES.BOARD]: {
      PUSH: true,
      EMAIL: true,
      SMS: false,
    },
  },
} as const;
