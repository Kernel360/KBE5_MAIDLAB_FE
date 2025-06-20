// ===== 사용자 타입 상수 =====
export const USER_TYPES = {
  CONSUMER: 'CONSUMER',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
} as const;

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];

// ===== 로그인 가능한 사용자 타입 =====
export const LOGIN_USER_TYPES = {
  CONSUMER: USER_TYPES.CONSUMER,
  MANAGER: USER_TYPES.MANAGER,
} as const;

export type LoginUserType =
  (typeof LOGIN_USER_TYPES)[keyof typeof LOGIN_USER_TYPES];

// ===== 성별 상수 =====
export const GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
} as const;

export type Gender = (typeof GENDER)[keyof typeof GENDER];

// ===== 성별 한글명 =====
export const GENDER_LABELS = {
  [GENDER.MALE]: '남성',
  [GENDER.FEMALE]: '여성',
} as const;

// ===== 소셜 로그인 타입 =====
export const SOCIAL_TYPES = {
  KAKAO: 'KAKAO',
  GOOGLE: 'GOOGLE',
} as const;

export type SocialType = (typeof SOCIAL_TYPES)[keyof typeof SOCIAL_TYPES];

// ===== 소셜 로그인 한글명 =====
export const SOCIAL_TYPE_LABELS = {
  [SOCIAL_TYPES.KAKAO]: '카카오',
  [SOCIAL_TYPES.GOOGLE]: '구글',
} as const;

/**
 * 도우미 선호도(찜/블랙리스트/선택없음) 타입
 */
export type PreferenceType = 'LIKE' | 'BLACKLIST';

