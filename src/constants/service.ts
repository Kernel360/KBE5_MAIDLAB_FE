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

export interface ServiceDetailType {
  id: number;
  name: string;
  type: keyof typeof SERVICE_TYPES;
  price: number;
}

export const SERVICE_DETAIL_TYPES: Record<string, ServiceDetailType> = {
  대청소: {
    id: 1,
    name: '대청소',
    type: 'HOUSEKEEPING',
    price: 50000,
  },
  부분청소: {
    id: 2,
    name: '부분청소',
    type: 'HOUSEKEEPING',
    price: 30000,
  },
  기타청소: {
    id: 3,
    name: '기타청소',
    type: 'HOUSEKEEPING',
    price: 20000,
  },
  아이돌봄: {
    id: 4,
    name: '아이돌봄',
    type: 'CARE',
    price: 50000,
  },
  어르신돌봄: {
    id: 5,
    name: '어르신돌봄',
    type: 'CARE',
    price: 30000,
  },
} as const;

₩// ===== 서비스 추가 옵션 =====
export const SERVICE_OPTIONS = [
  { id: 'cooking', label: '요리', price: 10000, timeAdd: 60 },
  { id: 'ironing', label: '다림질', price: 10000, timeAdd: 60 },
  { id: 'cleaning_tools', label: '청소 도구 준비', price: 20000, timeAdd: 0 },
] as const;

export type ServiceOption = typeof SERVICE_OPTIONS[number];

// ===== 평수 옵션 =====
export const ROOM_SIZES = [
  { id: 10, label: '10평 이하' },
  { id: 20, label: '20평대' },
  { id: 30, label: '30평대' },
] as const;

export type RoomSizeOption = typeof ROOM_SIZES[number];