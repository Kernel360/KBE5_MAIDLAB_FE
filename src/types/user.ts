/**
 * 사용자 타입
 */
export type UserType = 'CONSUMER' | 'MANAGER' | 'ADMIN';

/**
 * 성별
 */
export type Gender = 'MALE' | 'FEMALE';

/**
 * 소셜 로그인 타입
 */
export type SocialType = 'KAKAO' | 'GOOGLE';

/**
 * 기본 사용자 정보
 */
export interface BaseUser {
  id: number;
  uuid: string;
  userType: UserType;
  phoneNumber: string;
  name: string;
  birth: string;
  gender: Gender;
  profileImage?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 소비자 정보
 */
export interface Consumer extends BaseUser {
  userType: 'CONSUMER';
  address?: string;
  detailAddress?: string;
  point: number;
}

/**
 * 매니저 정보
 */
export interface Manager extends BaseUser {
  userType: 'MANAGER';
  isVerified: ManagerVerificationStatus;
  averageRate: number;
  regions: string[];
  services: ServiceType[];
  schedules: Schedule[];
  introduceText?: string;
  documents: Document[];
}

/**
 * 관리자 정보
 */
export interface Admin extends BaseUser {
  userType: 'ADMIN';
  adminKey: string;
  permissions: string[];
}

/**
 * 매니저 승인 상태
 */
export type ManagerVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * 서비스 타입
 */
export type ServiceType = 'HOUSEKEEPING' | 'CARE';

/**
 * 스케줄 정보
 */
export interface Schedule {
  day: string;
  startTime: string;
  endTime: string;
}

/**
 * 문서 정보
 */
export interface Document {
  fileType: string;
  fileName: string;
  uploadedFileUrl: string;
}

/**
 * 로그인 요청
 */
export interface LoginRequest {
  userType: UserType;
  phoneNumber: string;
  password: string;
}

/**
 * 회원가입 요청
 */
export interface SignUpRequest {
  userType: UserType;
  phoneNumber: string;
  password: string;
  name: string;
  birth: string;
  gender: Gender;
}

/**
 * 소셜 로그인 요청
 */
export interface SocialLoginRequest {
  userType: UserType;
  socialType: SocialType;
  code: string;
}

/**
 * 소셜 회원가입 요청
 */
export interface SocialSignUpRequest {
  birth: string;
  gender: Gender;
}

/**
 * 로그인 응답
 */
export interface LoginResponse {
  accessToken: string;
  expirationTime: number;
}

/**
 * 소셜 로그인 응답
 */
export interface SocialLoginResponse {
  accessToken: string;
  expirationTime: number;
  newUser: boolean;
}

/**
 * 프로필 수정 요청 (소비자)
 */
export interface ConsumerProfileUpdateRequest {
  profileImage?: string;
  address?: string;
  detailAddress?: string;
}

/**
 * 프로필 수정 요청 (매니저)
 */
export interface ManagerProfileUpdateRequest {
  profileImage?: string;
  name: string;
  birth?: string;
  gender?: Gender;
  serviceTypes?: ServiceListItem[];
  regions: RegionListItem[];
  availableTimes: ScheduleListItem[];
  introduceText?: string;
}

/**
 * 서비스 리스트 아이템
 */
export interface ServiceListItem {
  serviceType: string;
}

/**
 * 지역 리스트 아이템
 */
export interface RegionListItem {
  region: string;
}

/**
 * 스케줄 리스트 아이템
 */
export interface ScheduleListItem {
  day: string;
  startTime: string;
  endTime: string;
}

/**
 * 비밀번호 변경 요청
 */
export interface PasswordChangeRequest {
  password: string;
}

/**
 * 사용자 마이페이지 정보
 */
export interface UserMyPageInfo {
  userid: number;
  userType: UserType;
  profileImage?: string;
  name: string;
  isVerified?: boolean;
  point?: number;
}
