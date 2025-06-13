// ===== 정규표현식 패턴 =====
export const VALIDATION_PATTERNS = {
  PHONE: /^01[0-9]{8,9}$/, // 휴대폰 번호
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // 이메일
  PASSWORD: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,20}$/, // 비밀번호 (영문+숫자, 8-20자)
  NAME: /^[가-힣a-zA-Z\s]{2,20}$/, // 이름 (한글, 영문, 2-20자)
  TIME: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // 시간 (HH:MM)
  DATE: /^\d{4}-\d{2}-\d{2}$/, // 날짜 (YYYY-MM-DD)
  NUMBER_ONLY: /^\d+$/, // 숫자만
  KOREAN_ONLY: /^[가-힣\s]+$/, // 한글만
  ENGLISH_ONLY: /^[a-zA-Z\s]+$/, // 영문만
  POSTAL_CODE: /^\d{5}$/, // 우편번호 (5자리)
} as const;

// ===== 길이 제한 =====
export const LENGTH_LIMITS = {
  PASSWORD: {
    MIN: 8,
    MAX: 20,
  },
  NAME: {
    MIN: 2,
    MAX: 20,
  },
  PHONE: {
    MIN: 10,
    MAX: 11,
  },
  TITLE: {
    MIN: 2,
    MAX: 100,
  },
  CONTENT: {
    MIN: 10,
    MAX: 2000,
  },
  ADDRESS: {
    MIN: 5,
    MAX: 200,
  },
  INTRODUCE: {
    MIN: 10,
    MAX: 500,
  },
  REVIEW_COMMENT: {
    MIN: 5,
    MAX: 300,
  },
  SPECIAL_REQUEST: {
    MAX: 500,
  },
} as const;

// ===== 숫자 범위 제한 =====
export const NUMBER_LIMITS = {
  ROOM_SIZE: {
    MIN: 10, // 최소 평수
    MAX: 300, // 최대 평수
  },
  RATING: {
    MIN: 1, // 최소 별점
    MAX: 5, // 최대 별점
  },
  PRICE: {
    MIN: 10000, // 최소 가격 (1만원)
    MAX: 1000000, // 최대 가격 (100만원)
  },
  AGE: {
    MIN: 18, // 최소 나이
    MAX: 80, // 최대 나이
  },
  WORKING_HOURS: {
    MIN: 1, // 최소 근무시간
    MAX: 12, // 최대 근무시간
  },
} as const;

// ===== 파일 제한 =====
export const FILE_LIMITS = {
  IMAGE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    MAX_COUNT: 10,
  },
  DOCUMENT: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    MAX_COUNT: 5,
  },
  PROFILE_IMAGE: {
    MAX_SIZE: 2 * 1024 * 1024, // 2MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
    MAX_COUNT: 1,
  },
} as const;

// ===== 유효성 검사 메시지 =====
export const VALIDATION_MESSAGES = {
  REQUIRED: '필수 입력 항목입니다.',
  INVALID_FORMAT: '올바른 형식이 아닙니다.',
  PHONE: {
    REQUIRED: '휴대폰 번호를 입력해주세요.',
    INVALID: '올바른 휴대폰 번호를 입력해주세요. (예: 01012345678)',
  },
  EMAIL: {
    REQUIRED: '이메일을 입력해주세요.',
    INVALID: '올바른 이메일 형식을 입력해주세요.',
  },
  PASSWORD: {
    REQUIRED: '비밀번호를 입력해주세요.',
    INVALID: '비밀번호는 영문과 숫자를 포함하여 8-20자로 입력해주세요.',
    MISMATCH: '비밀번호가 일치하지 않습니다.',
  },
  NAME: {
    REQUIRED: '이름을 입력해주세요.',
    INVALID: '이름은 한글 또는 영문 2-20자로 입력해주세요.',
  },
  BIRTH: {
    REQUIRED: '생년월일을 입력해주세요.',
    INVALID: '올바른 생년월일을 입력해주세요.',
    INVALID_FORMAT: '올바른 날짜 형식으로 입력해주세요 (YYYY-MM-DD)',
    INVALID_YEAR: '1925년부터 올해까지 입력 가능합니다',
    INVALID_MONTH: '월은 01~12 사이로 입력해주세요',
    INVALID_DAY: '일은 01~31 사이로 입력해주세요',
    INVALID_DATE: '존재하지 않는 날짜입니다',
    FUTURE_DATE: '미래 날짜는 입력할 수 없습니다',
    TOO_YOUNG: '만 14세 이상만 가입 가능합니다',
    TOO_OLD: '올바른 생년월일을 입력해주세요',
  },
  GENDER: {
    REQUIRED: '성별을 선택해주세요.',
  },
  ADDRESS: {
    REQUIRED: '주소를 입력해주세요.',
    INVALID: '주소는 5-200자로 입력해주세요.',
  },
  TIME: {
    REQUIRED: '시간을 선택해주세요.',
    INVALID: '올바른 시간 형식을 입력해주세요. (예: 09:00)',
  },
  DATE: {
    REQUIRED: '날짜를 선택해주세요.',
    INVALID: '올바른 날짜를 선택해주세요.',
    PAST: '과거 날짜는 선택할 수 없습니다.',
  },
  RATING: {
    REQUIRED: '별점을 선택해주세요.',
    INVALID: '별점은 1-5점 사이로 선택해주세요.',
  },
  PRICE: {
    REQUIRED: '가격을 입력해주세요.',
    INVALID: '가격은 10,000원 이상 1,000,000원 이하로 입력해주세요.',
  },
  FILE: {
    SIZE_EXCEEDED: '파일 크기가 너무 큽니다.',
    TYPE_NOT_ALLOWED: '허용되지 않는 파일 형식입니다.',
    COUNT_EXCEEDED: '파일 개수가 초과되었습니다.',
  },
  TITLE: {
    REQUIRED: '제목을 입력해주세요.',
    LENGTH: '제목은 2-100자로 입력해주세요.',
  },
  CONTENT: {
    REQUIRED: '내용을 입력해주세요.',
    LENGTH: '내용은 10-2000자로 입력해주세요.',
  },
} as const;

// ===== 생년월일 범위 =====
export const DATE_LIMITS = {
  BIRTH: {
    MIN_YEAR: new Date().getFullYear() - 80, // 80세
    MAX_YEAR: new Date().getFullYear() - 18, // 18세
  },
  RESERVATION: {
    MIN_DATE: new Date(), // 오늘부터
    MAX_DATE: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90일 후까지
  },
} as const;

// ===== 시간 범위 =====
export const TIME_LIMITS = {
  SERVICE: {
    START_TIME: '06:00',
    END_TIME: '22:00',
    MIN_DURATION: 2, // 최소 2시간
    MAX_DURATION: 8, // 최대 8시간
  },
} as const;
