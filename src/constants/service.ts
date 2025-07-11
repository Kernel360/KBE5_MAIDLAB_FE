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

// ===== 서비스 타입 상수 (이미지 표 기준) =====
export const SERVICE_TYPES = {
  GENERAL_CLEANING: 'GENERAL_CLEANING',
  BABYSITTER: 'BABYSITTER',
  PET_CARE: 'PET_CARE',
} as const;

export type ServiceType = (typeof SERVICE_TYPES)[keyof typeof SERVICE_TYPES];

// ===== 서비스 타입 한글명 (이미지 표 기준) =====
export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  [SERVICE_TYPES.GENERAL_CLEANING]: '일반청소',
  [SERVICE_TYPES.BABYSITTER]: '베이비시터',
  [SERVICE_TYPES.PET_CARE]: '반려동물 케어',
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

// ===== 서비스 상세 타입 인터페이스 (이미지 표 기준) =====
export interface ServiceDetailType {
  id: number;
  name: string;
  type: ServiceType;
  basePrice?: number; // 금액이 없는 경우 undefined (추가 예정/산책 등)
  description?: string;
  options?: string[];
}

// ===== 서비스 상세 타입 정의 (이미지 표 기준) =====
export const SERVICE_DETAIL_TYPES: Record<string, ServiceDetailType> = {
  // 일반청소
  생활청소: {
    id: 1,
    name: '생활청소',
    type: SERVICE_TYPES.GENERAL_CLEANING,
    basePrice: 34800, // 2시간(변동요금)
    description:
      '생활공간 먼지 제거 및 바닥 청소, 물건 정리정돈, 주방/욕실/베란다/현관/분리수거 등',
    options: [
      '생활공간 먼지 제거 및 바닥 청소',
      '물건 제자리 정리정돈',
      '주방 청소 (설거지, 싱크대, 가스레인지 및 인덕션, 후드 청소)',
      '욕실 청소 (욕조, 변기, 세면대, 거울, 바닥 청소)',
      '베란다 청소 (물청소는 미포함)',
      '현관 앞 신발 정리정돈',
      '분류된 재활용품 및 일반 쓰레기, 음식물 쓰레기 배출',
    ],
  },
  부분청소: {
    id: 2,
    name: '부분청소',
    type: SERVICE_TYPES.GENERAL_CLEANING,
    description: '에어컨/세탁기/냉장고/욕실 등 부분 청소',
    options: [
      '에어컨 청소',
      '세탁기 청소',
      '냉장고 청소',
      '욕실 청소 (욕조, 변기, 세면대, 거울, 바닥 청소)',
    ],
  },
  // 베이비시터
  영유아돌봄: {
    id: 3,
    name: '영유아 돌봄',
    type: SERVICE_TYPES.BABYSITTER,
    description:
      '수유, 이유식 먹이기, 기저귀 갈기, 재우기, 목욕시키기, 놀이 활동, 간단한 세탁 등',
    options: [
      '아이의 건강 관리, 위생 돌봄, 수면, 위생 관리 등',
      '기저귀 및 이유식 챙기기, 간단한 식사 준비, 목욕 등',
    ],
  },
  유아교육: {
    id: 4,
    name: '유아 교육',
    type: SERVICE_TYPES.BABYSITTER,
    description: '학습 보조, 독서 지도, 놀이 활동 등',
    options: ['아이의 학업/공부 도와주기', '놀이 활동, 독서 지도 등'],
  },
  // 반려동물 케어
  기본돌봄: {
    id: 5,
    name: '기본 돌봄',
    type: SERVICE_TYPES.PET_CARE,
    description: '기본 돌봄(배식/산책/배변 정리/응급처치 등)',
    options: ['배식/급수', '배변 정리', '응급처치', '운동/놀이'],
  },
  산책: {
    id: 6,
    name: '산책',
    type: SERVICE_TYPES.PET_CARE,
    description: '반려동물 산책 서비스',
    options: ['기본 산책', '리드줄 착용', '배변 정리'],
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

export const SERVICE_LIST = [
  {
    id: SERVICE_TYPES.GENERAL_CLEANING,
    label: SERVICE_TYPE_LABELS[SERVICE_TYPES.GENERAL_CLEANING],
    icon: '🏠',
  },
  {
    id: SERVICE_TYPES.BABYSITTER,
    label: SERVICE_TYPE_LABELS[SERVICE_TYPES.BABYSITTER],
    icon: '👩‍🍼',
  },
  {
    id: SERVICE_TYPES.PET_CARE,
    label: SERVICE_TYPE_LABELS[SERVICE_TYPES.PET_CARE],
    icon: '🦮',
  },
];

export const SERVICE_OPTIONS = [
  {
    id: 'WINDOW_CLEANING',
    label: '창문 유리/커튼 및 블라인드 청소',
    timeAdd: 90, // 1.5시간 = 90분
    priceAdd: 27900,
  },
  {
    id: 'FAN_CLEANING',
    label: '선풍기 청소',
    timeAdd: 20, // 20분
    priceAdd: 7800,
    countable: true, // 개수 선택 가능
  },
  {
    id: 'SHOES_CLEANING',
    label: '운동화 세탁',
    timeAdd: 30, // 0.5시간 = 30분
    priceAdd: 8600,
    countable: true, // 개수 선택 가능
  },
  {
    id: 'IRONING',
    label: '다림질',
    timeAdd: 60, // 1시간 = 60분
    priceAdd: 15600,
  },
];

// 개수 선택 가능한 옵션의 최대 개수
export const MAX_COUNTABLE_ITEMS = 5;

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

// ===== 생활청소 평수별 요금/시간 기준표 (이미지 표 기준) =====
export const ROOM_SIZES_LIFE_CLEANING = [
  { range: '8평 이하', baseTime: 3.5, unitPrice: 15000, estimatedPrice: 52500 },
  { range: '9~10평', baseTime: 3.5, unitPrice: 15600, estimatedPrice: 54600 },
  { range: '11~15평', baseTime: 4, unitPrice: 15750, estimatedPrice: 63000 },
  { range: '16~20평', baseTime: 4, unitPrice: 16000, estimatedPrice: 64000 },
  { range: '21~25평', baseTime: 4.5, unitPrice: 16500, estimatedPrice: 74250 },
  { range: '26~30평', baseTime: 4.5, unitPrice: 16800, estimatedPrice: 75600 },
  { range: '31~34평', baseTime: 4.5, unitPrice: 17000, estimatedPrice: 76500 },
  {
    range: '35평 이상',
    baseTime: 4.5,
    unitPrice: 17150,
    estimatedPrice: 78000,
  },
];

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

// ===== 비즈니스 룰 설정 =====
export const BUSINESS_CONFIG = {
  ROOM_SIZES: [
    { key: 'STUDIO', label: '원룸/스튜디오', basePrice: 50000 },
    { key: 'ONE_ROOM', label: '1.5룸', basePrice: 60000 },
    { key: 'TWO_ROOM', label: '2룸', basePrice: 70000 },
    { key: 'THREE_ROOM', label: '3룸', basePrice: 80000 },
    { key: 'FOUR_PLUS_ROOM', label: '4룸 이상', basePrice: 100000 },
  ],
  SERVICE_HOURS: {
    START: 9,
    END: 18,
  },
  MAX_FILE_SIZE_MB: 10,
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  SUPPORTED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
} as const;
