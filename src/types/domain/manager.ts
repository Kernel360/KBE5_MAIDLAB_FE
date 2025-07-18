import type { BaseUser } from './user';
import type { Gender, UserType, SocialType } from '@/constants/user';
import type { ServiceType } from '@/constants/service';
import type { ManagerVerificationStatus } from '@/constants/status';

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
 * 스케줄 정보
 */
export interface Schedule {
  day: string;
  startTime: string;
  endTime: string;
}

/**
 * 스케줄 리스트 아이템 (API용)
 */
export type ScheduleListItem = Schedule;

/**
 * 문서 정보
 */
export interface Document {
  fileType: string;
  fileName: string;
  uploadedFileUrl: string;
}

/**
 * 문서 리스트 아이템 (API용)
 */
export type DocumentListItem = Document;

/**
 * 매니저 프로필 생성 요청
 */
export interface ManagerProfileCreateRequest {
  profileImage?: string;
  serviceTypes: ServiceListItem[];
  regions: RegionListItem[];
  availableTimes: ScheduleListItem[];
  introduceText?: string;
  documents: DocumentListItem[];
}

/**
 * 매니저 프로필 수정 요청
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
  emergencyCall?: string;
}

/**
 * 매니저 프로필 응답
 */
export interface ManagerProfileResponse {
  userId: number;
  userType: UserType;
  isVerified: boolean;
  profileImage?: string;
  name: string;
  birth: string;
  gender: Gender;
  regions: RegionListItem[];
  schedules: ScheduleListItem[];
  services: string[];
  introduceText?: string;
  documents?: DocumentListItem[];
  emergencyCall?: string | null; // 소셜 로그인 사용자만 값이 있음
}

/**
 * 매니저 마이페이지 응답
 */
export interface ManagerMyPageResponse {
  userId: number;
  userType: UserType;
  profileImage?: string;
  name: string;
  isVerified: boolean;
  socialType: SocialType;
}

/**
 * 매니저 리뷰 아이템
 */
export interface ManagerReviewItem {
  reviewId: string;
  rating: number;
  name: string;
  comment: string;
  serviceType: string;
  serviceDetailType: string;
}

/**
 * 리뷰 목록 응답
 */
export interface ManagerReviewListResponse {
  reviews: ManagerReviewItem[];
}

/**
 * 매니저 상세 정보 (공개용)
 */
export interface ManagerDetail extends BaseUser {
  userType: 'MANAGER';
  isVerified: ManagerVerificationStatus;
  averageRate: number;
  regions: string[];
  services: ServiceType[];
  schedules: Schedule[];
  introduceText?: string;
  reviewCount: number;
}

/**
 * 매니저 검색 필터
 */
export interface ManagerSearchFilter {
  regions?: string[];
  services?: ServiceType[];
  averageRateMin?: number;
  averageRateMax?: number;
  isVerified?: boolean;
  availableDate?: string;
  availableTime?: {
    startTime: string;
    endTime: string;
  };
}

/**
 * 매니저 정렬 옵션
 */
export interface ManagerSortOption {
  field: 'averageRate' | 'reviewCount' | 'distance' | 'createdAt';
  direction: 'ASC' | 'DESC';
}

/**
 * 매니저 통계
 */
export interface ManagerStats {
  totalReservations: number;
  completedReservations: number;
  averageRating: number;
  totalEarnings: number;
  thisMonthEarnings: number;
  reviewCount: number;
}

/**
 * 매니저 프로필 폼 데이터
 */
export interface ManagerProfileFormData {
  profileImage?: string;
  serviceTypes: string[];
  regions: string[];
  availableTimes: Schedule[];
  introduceText: string;
  documents: Document[];
}

/**
 * 매니저 프로필 유효성 검사 에러
 */
export interface ManagerProfileErrors {
  profileImage?: string;
  serviceTypes?: string;
  regions?: string;
  availableTimes?: string;
  introduceText?: string;
  documents?: string;
}
