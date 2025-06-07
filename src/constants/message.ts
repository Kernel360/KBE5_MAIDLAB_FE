// messages.ts
// ===== 성공 메시지 =====
export const SUCCESS_MESSAGES = {
  // 인증 관련
  LOGIN: '로그인이 완료되었습니다.',
  LOGOUT: '로그아웃이 완료되었습니다.',
  SIGNUP: '회원가입이 완료되었습니다.',
  PASSWORD_CHANGED: '비밀번호가 변경되었습니다.',
  ACCOUNT_DELETED: '회원탈퇴가 완료되었습니다.',

  // 프로필 관련
  PROFILE_CREATED: '프로필이 등록되었습니다.',
  PROFILE_UPDATED: '프로필이 수정되었습니다.',

  // 예약 관련
  RESERVATION_CREATED: '예약이 완료되었습니다.',
  RESERVATION_CANCELED: '예약이 취소되었습니다.',
  RESERVATION_APPROVED: '예약이 승인되었습니다.',
  RESERVATION_REJECTED: '예약이 거절되었습니다.',

  // 체크인/아웃
  CHECKIN_SUCCESS: '체크인이 완료되었습니다.',
  CHECKOUT_SUCCESS: '체크아웃이 완료되었습니다.',

  // 리뷰 관련
  REVIEW_SUBMITTED: '리뷰가 등록되었습니다.',

  // 매칭 관련
  MATCHING_STARTED: '매칭이 시작되었습니다.',

  // 찜하기/블랙리스트
  MANAGER_LIKED: '찜 목록에 추가되었습니다.',
  MANAGER_UNLIKED: '찜 목록에서 제거되었습니다.',
  MANAGER_BLACKLISTED: '블랙리스트에 추가되었습니다.',

  // 게시판 관련
  BOARD_CREATED: '게시글이 등록되었습니다.',
  ANSWER_SUBMITTED: '답변이 등록되었습니다.',

  // 관리자 관련
  MANAGER_APPROVED: '매니저가 승인되었습니다.',
  MANAGER_REJECTED: '매니저가 거절되었습니다.',
  MANAGER_CHANGED: '매니저가 변경되었습니다.',

  // 이벤트 관련
  EVENT_CREATED: '이벤트가 생성되었습니다.',
  EVENT_UPDATED: '이벤트가 수정되었습니다.',
  EVENT_DELETED: '이벤트가 삭제되었습니다.',

  // 일반
  SAVE: '저장이 완료되었습니다.',
  DELETE: '삭제가 완료되었습니다.',
  UPDATE: '수정이 완료되었습니다.',
  COPY: '클립보드에 복사되었습니다.',
} as const;

// ===== 에러 메시지 =====
export const ERROR_MESSAGES = {
  // 네트워크 관련
  NETWORK: '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.',
  SERVER: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  TIMEOUT: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
  UNKNOWN: '알 수 없는 오류가 발생했습니다.',

  // 인증 관련
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '권한이 없습니다.',
  TOKEN_EXPIRED: '인증이 만료되었습니다. 다시 로그인해주세요.',
  INVALID_CREDENTIALS: '아이디 또는 비밀번호가 올바르지 않습니다.',
  ACCOUNT_NOT_FOUND: '존재하지 않는 계정입니다.',
  ACCOUNT_SUSPENDED: '정지된 계정입니다.',

  // 유효성 검사
  VALIDATION: '입력값을 확인해주세요.',
  REQUIRED_FIELD: '필수 입력 항목입니다.',
  INVALID_FORMAT: '올바른 형식이 아닙니다.',

  // 중복 관련
  DUPLICATE_PHONE: '이미 사용중인 전화번호입니다.',
  DUPLICATE_EMAIL: '이미 사용중인 이메일입니다.',
  DUPLICATE_RESERVATION: '이미 예약된 시간입니다.',

  // 예약 관련
  RESERVATION_NOT_FOUND: '예약 정보를 찾을 수 없습니다.',
  RESERVATION_CANCELED: '취소된 예약입니다.',
  RESERVATION_COMPLETED: '이미 완료된 예약입니다.',
  CANNOT_CANCEL: '취소할 수 없는 예약입니다.',
  INVALID_RESERVATION_TIME: '올바르지 않은 예약 시간입니다.',

  // 매니저 관련
  MANAGER_NOT_FOUND: '매니저를 찾을 수 없습니다.',
  MANAGER_NOT_AVAILABLE: '예약 가능한 매니저가 없습니다.',
  MANAGER_ALREADY_APPROVED: '이미 승인된 매니저입니다.',

  // 파일 관련
  FILE_TOO_LARGE: '파일 크기가 너무 큽니다.',
  INVALID_FILE_TYPE: '지원하지 않는 파일 형식입니다.',
  FILE_UPLOAD_FAILED: '파일 업로드에 실패했습니다.',

  // 페이지 관련
  PAGE_NOT_FOUND: '페이지를 찾을 수 없습니다.',
  ACCESS_DENIED: '접근이 거부되었습니다.',

  // 결제 관련
  PAYMENT_FAILED: '결제에 실패했습니다.',
  INVALID_AMOUNT: '올바르지 않은 금액입니다.',

  // 기타
  NO_DATA: '데이터가 없습니다.',
  LOAD_FAILED: '데이터를 불러오는데 실패했습니다.',
  SAVE_FAILED: '저장에 실패했습니다.',
  DELETE_FAILED: '삭제에 실패했습니다.',
} as const;

// ===== 확인 메시지 =====
export const CONFIRM_MESSAGES = {
  // 삭제 관련
  DELETE: '정말 삭제하시겠습니까?',
  DELETE_ACCOUNT: '정말 회원탈퇴를 하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
  DELETE_RESERVATION: '예약을 취소하시겠습니까?',
  DELETE_REVIEW: '리뷰를 삭제하시겠습니까?',

  // 로그아웃
  LOGOUT: '로그아웃 하시겠습니까?',

  // 승인/거절
  APPROVE_MANAGER: '매니저를 승인하시겠습니까?',
  REJECT_MANAGER: '매니저를 거절하시겠습니까?',

  // 예약 관련
  CANCEL_RESERVATION: '예약을 취소하시겠습니까?',
  APPROVE_RESERVATION: '예약을 승인하시겠습니까?',
  REJECT_RESERVATION: '예약을 거절하시겠습니까?',

  // 변경 관련
  UNSAVED_CHANGES:
    '저장하지 않은 변경사항이 있습니다. 페이지를 떠나시겠습니까?',
  CHANGE_MANAGER: '매니저를 변경하시겠습니까?',

  // 제출 관련
  SUBMIT_REVIEW: '리뷰를 제출하시겠습니까?',
  SUBMIT_APPLICATION: '신청서를 제출하시겠습니까?',

  // 일반
  PROCEED: '계속 진행하시겠습니까?',
  RESET: '입력한 내용을 초기화하시겠습니까?',
} as const;

// ===== 정보 메시지 =====
export const INFO_MESSAGES = {
  // 안내 메시지
  LOADING: '로딩 중입니다...',
  PROCESSING: '처리 중입니다...',
  UPLOADING: '업로드 중입니다...',
  SAVING: '저장 중입니다...',

  // 빈 상태
  NO_RESERVATIONS: '예약 내역이 없습니다.',
  NO_REVIEWS: '리뷰가 없습니다.',
  NO_NOTIFICATIONS: '알림이 없습니다.',
  NO_SEARCH_RESULTS: '검색 결과가 없습니다.',
  NO_MANAGERS: '매니저가 없습니다.',

  // 상태 안내
  WAITING_APPROVAL: '승인 대기 중입니다.',
  IN_PROGRESS: '진행 중입니다.',
  COMPLETED: '완료되었습니다.',

  // 도움말
  PHONE_FORMAT_HELP: '휴대폰 번호는 하이픈(-) 없이 입력해주세요.',
  PASSWORD_HELP: '영문과 숫자를 포함하여 8-20자로 입력해주세요.',
  FILE_UPLOAD_HELP: 'JPG, PNG 파일만 업로드 가능합니다. (최대 5MB)',

  // 기능 설명
  BLACKLIST_INFO: '블랙리스트에 추가된 매니저는 매칭에서 제외됩니다.',
  REVIEW_INFO: '서비스 완료 후 리뷰를 작성할 수 있습니다.',
  MATCHING_INFO: '선호하는 매니저를 선택하거나 자동 매칭을 이용할 수 있습니다.',
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
