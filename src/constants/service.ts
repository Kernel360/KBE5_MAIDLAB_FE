// ===== 통화 관련 =====
export const CURRENCY = {
  KRW: 'KRW',
  USD: 'USD',
  EUR: 'EUR',
} as const;

export type Currency = (typeof CURRENCY)[keyof typeof CURRENCY];

/**
 * 금액 인터페이스
 */
export interface MoneyAmount {
  value: number;
  currency: Currency;
  formatted: string; // "150,000원" 형태
}

// ===== 서비스 타입 상수 =====
export const SERVICE_TYPES = {
  HOUSEKEEPING: 'HOUSEKEEPING',
  CARE: 'CARE',
} as const;

export type ServiceType = (typeof SERVICE_TYPES)[keyof typeof SERVICE_TYPES];

// ===== 서비스 타입 한글명 =====
export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
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
export const WEEKDAY_LABELS: Record<Weekday, string> = {
  [WEEKDAYS.MONDAY]: '월요일',
  [WEEKDAYS.TUESDAY]: '화요일',
  [WEEKDAYS.WEDNESDAY]: '수요일',
  [WEEKDAYS.THURSDAY]: '목요일',
  [WEEKDAYS.FRIDAY]: '금요일',
  [WEEKDAYS.SATURDAY]: '토요일',
  [WEEKDAYS.SUNDAY]: '일요일',
} as const;

// ===== 요일 짧은 형태 =====
export const WEEKDAY_SHORT_LABELS: Record<Weekday, string> = {
  [WEEKDAYS.MONDAY]: '월',
  [WEEKDAYS.TUESDAY]: '화',
  [WEEKDAYS.WEDNESDAY]: '수',
  [WEEKDAYS.THURSDAY]: '목',
  [WEEKDAYS.FRIDAY]: '금',
  [WEEKDAYS.SATURDAY]: '토',
  [WEEKDAYS.SUNDAY]: '일',
} as const;

// ===== 서비스 상세 타입 인터페이스 =====
export interface ServiceDetailType {
  id: number;
  name: string;
  type: ServiceType;
  basePrice: number; // ✅ 단순한 숫자값으로 저장
  description?: string;
  duration?: number; // 기본 소요 시간 (분)
}

// ===== 서비스 상세 타입 정의 =====
export const SERVICE_DETAIL_TYPES: Record<string, ServiceDetailType> = {
  대청소: {
    id: 1,
    name: '대청소',
    type: SERVICE_TYPES.HOUSEKEEPING,
    basePrice: 50000,
    description: '집 전체를 깨끗하게 청소해드립니다',
    duration: 240, // 4시간
  },
  부분청소: {
    id: 2,
    name: '부분청소',
    type: SERVICE_TYPES.HOUSEKEEPING,
    basePrice: 30000,
    description: '필요한 부분만 선택적으로 청소해드립니다',
    duration: 120, // 2시간
  },
  기타청소: {
    id: 3,
    name: '기타청소',
    type: SERVICE_TYPES.HOUSEKEEPING,
    basePrice: 20000,
    description: '특별한 청소 요청사항을 처리해드립니다',
    duration: 90, // 1.5시간
  },
  아이돌봄: {
    id: 4,
    name: '아이돌봄',
    type: SERVICE_TYPES.CARE,
    basePrice: 50000,
    description: '아이들을 안전하고 즐겁게 돌봐드립니다',
    duration: 240, // 4시간
  },
  어르신돌봄: {
    id: 5,
    name: '어르신돌봄',
    type: SERVICE_TYPES.CARE,
    basePrice: 30000,
    description: '어르신들을 정성스럽게 돌봐드립니다',
    duration: 180, // 3시간
  },
} as const;

// ===== 서비스 추가 옵션 =====
export interface ServiceOption {
  id: string;
  label: string;
  price: number; // ✅ 단순한 숫자값으로 저장
  timeAdd: number; // 추가 소요 시간 (분)
  description?: string;
}

export const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: 'cooking',
    label: '요리',
    price: 10000,
    timeAdd: 60,
    description: '간단한 요리를 준비해드립니다',
  },
  {
    id: 'ironing',
    label: '다림질',
    price: 10000,
    timeAdd: 60,
    description: '의류 다림질을 해드립니다',
  },
  {
    id: 'cleaning_tools',
    label: '청소 도구 준비',
    price: 20000,
    timeAdd: 0,
    description: '전문 청소 도구를 준비해드립니다',
  },
] as const;

// ===== 평수 옵션 =====
export interface RoomSizeOption {
  id: number;
  label: string;
  priceMultiplier: number; // 가격 배수 (기본 가격에 곱할 값)
}

export const ROOM_SIZES: RoomSizeOption[] = [
  { id: 10, label: '10평 이하', priceMultiplier: 0.8 },
  { id: 20, label: '20평대', priceMultiplier: 1.0 },
  { id: 30, label: '30평대', priceMultiplier: 1.3 },
  { id: 40, label: '40평대', priceMultiplier: 1.6 },
  { id: 50, label: '50평 이상', priceMultiplier: 2.0 },
] as const;

// ===== 수수료 관련 상수 =====
export const FEE_CONFIG = {
  PLATFORM_FEE_RATE: 0.1, // 10% 플랫폼 수수료
  VAT_RATE: 0.1, // 10% 부가세
  MINIMUM_FEE: 1000, // 최소 수수료 (숫자값)
  MAXIMUM_FEE: 50000, // 최대 수수료 (숫자값)
} as const;

// ===== 통화 포맷터 맵 =====
export const CURRENCY_FORMATTERS: Record<Currency, (value: number) => string> =
  {
    [CURRENCY.KRW]: (val) => `${val.toLocaleString('ko-KR')}원`,
    [CURRENCY.USD]: (val) => `$${val.toLocaleString('en-US')}`,
    [CURRENCY.EUR]: (val) => `€${val.toLocaleString('de-DE')}`,
  } as const;
