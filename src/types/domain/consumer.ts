import type { BaseUser } from './user';
import type { Gender, PreferenceType} from '@/constants/user';

/**
 * 소비자 프로필 생성 요청
 */
export interface ConsumerProfileCreateRequest {
  profileImage?: string;
  address?: string;
  detailAddress?: string;
}

/**
 * 소비자 프로필 수정 요청
 */
export interface ConsumerProfileUpdateRequest {
  profileImage?: string;
  name?: string;
  gender?: Gender
  birth?: string
  address?: string;
  detailAddress?: string;
}

/**
 * 소비자 프로필 응답
 */
export interface ConsumerProfileResponse {
  profileImage?: string;
  name: string;
  birth: string;
  gender: Gender;
  address?: string;
  detailAddress?: string;
}

/**
 * 소비자 마이페이지 응답
 */
export interface ConsumerMyPageResponse {
  name: string;
  point: number;
  profileImage?: string;
  socialType?: string;
}

/**
 * 선호도 등록 요청
 */
export interface PreferenceRequest {
  preference: boolean; // true: 찜, false: 블랙리스트
}

/**
 * 찜한 매니저 응답
 */
export interface LikedManagerResponse {
  managerUuid: string;
  name: string;
  profileImage?: string;
  averageRate: number;
  introduceText?: string;
  region: string[];
}

/**
 * 블랙리스트 매니저 응답
 */
export interface BlackListedManagerResponse {
  managerUuid: string;
  name: string;
  profileImage?: string;
  averageRate: number;
  introduceText?: string;
  region: string[];
}

/**
 * 소비자 상세 정보
 */
export interface ConsumerDetail extends BaseUser {
  userType: 'CONSUMER';
  address?: string;
  detailAddress?: string;
  point: number;
  totalReservations: number;
  completedReservations: number;
}

/**
 * 소비자 프로필 폼 데이터
 */
export interface ConsumerProfileFormData {
  profileImage?: string;
  address: string;
  detailAddress: string;
}

/**
 * 소비자 프로필 유효성 검사 에러
 */
export interface ConsumerProfileErrors {
  address?: string;
  detailAddress?: string;
  profileImage?: string;
}

/**
 * 소비자 통계
 */
export interface ConsumerStats {
  totalReservations: number;
  completedReservations: number;
  canceledReservations: number;
  totalSpent: number;
  currentPoints: number;
  likedManagers: number;
  blacklistedManagers: number;
}

/**
 * 소비자 알림 설정
 */
export interface ConsumerNotificationSettings {
  reservationUpdates: boolean;
  managerMessages: boolean;
  promotions: boolean;
  newsletter: boolean;
}

/**
 * 소비자 활동 로그
 */
export interface ConsumerActivityLog {
  id: string;
  type: 'RESERVATION' | 'REVIEW' | 'PREFERENCE' | 'PROFILE_UPDATE';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * 포인트 내역
 */
export interface PointHistory {
  id: string;
  type: 'EARNED' | 'USED' | 'EXPIRED';
  amount: number;
  description: string;
  reservationId?: number;
  timestamp: string;
  expiresAt?: string;
}

/**
 * 포인트 내역 응답
 */
export interface PointHistoryResponse {
  currentPoints: number;
  totalEarned: number;
  totalUsed: number;
  expiringPoints: number;
  history: PointHistory[];
}

/**
 * 리뷰 등록 폼의 상태 타입
 */
export interface ReviewFormData {
  rating: number;
  comment: string;
  preference: PreferenceType;
}

/**
 * 소비자 프로필/프로필 수정 등에서 사용하는 사용자 정보 타입
  */
export interface ProfileData {
  name: string;
  birth: string;
  gender: Gender;
  address: string;
  detailAddress: string;
  profileImage: string | undefined;
}
export interface PointRecordResponseDto {
  amount: number;
  pointType: string;
  description: string;
  createdAt: string;
}

