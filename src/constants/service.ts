// ===== 서비스 타입 상수 =====
export const SERVICE_TYPES = {
  HOUSEKEEPING: 'HOUSEKEEPING',
  CARE: 'CARE',
} as const;

export type ServiceType = (typeof SERVICE_TYPES)[keyof typeof SERVICE_TYPES];

// ===== 서비스 타입 한글명 =====
export const SERVICE_TYPE_LABELS = {
  [SERVICE_TYPES.HOUSEKEEPING]: '가사도우미',
  [SERVICE_TYPES.CARE]: '돌봄서비스',
} as const;

// ===== 주거 타입 상수 =====
export const HOUSING_TYPES = {
  APT: '아파트',
  VILLA: '빌라',
  HOUSE: '단독주택',
  OFFICETEL: '오피스텔',
} as const;

export type HousingType = keyof typeof HOUSING_TYPES;

// ===== 반려동물 상수 =====
export const PET_TYPES = {
  NONE: '없음',
  DOG: '강아지',
  CAT: '고양이',
  ETC: '기타',
} as const;

export type PetType = keyof typeof PET_TYPES;

// ===== 요일 상수 =====
export const WEEKDAYS = {
  MONDAY: 'MONDAY',
  TUESDAY: 'TUESDAY',
  WEDNESDAY: 'WEDNESDAY',
  THURSDAY: 'THURSDAY',
  FRIDAY: 'FRIDAY',
  SATURDAY: 'SATURDAY',
  SUNDAY: 'SUNDAY',
} as const;

export type Weekday = (typeof WEEKDAYS)[keyof typeof WEEKDAYS];

// ===== 요일 한글명 =====
export const WEEKDAY_LABELS = {
  [WEEKDAYS.MONDAY]: '월요일',
  [WEEKDAYS.TUESDAY]: '화요일',
  [WEEKDAYS.WEDNESDAY]: '수요일',
  [WEEKDAYS.THURSDAY]: '목요일',
  [WEEKDAYS.FRIDAY]: '금요일',
  [WEEKDAYS.SATURDAY]: '토요일',
  [WEEKDAYS.SUNDAY]: '일요일',
} as const;

// ===== 요일 짧은 형태 =====
export const WEEKDAY_SHORT_LABELS = {
  [WEEKDAYS.MONDAY]: '월',
  [WEEKDAYS.TUESDAY]: '화',
  [WEEKDAYS.WEDNESDAY]: '수',
  [WEEKDAYS.THURSDAY]: '목',
  [WEEKDAYS.FRIDAY]: '금',
  [WEEKDAYS.SATURDAY]: '토',
  [WEEKDAYS.SUNDAY]: '일',
} as const;
