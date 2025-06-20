import type { ReservationStatus } from '@/constants/status';

/**
 * 매칭 상태 (ReservationStatus와 동일)
 */
export type MatchingStatus = ReservationStatus;

/**
 * 매칭 요청
 */
export interface MatchingRequest {
  address: string;
  startTime: string;
  endTime: string;
  managerChoose: boolean;
}

/**
 * 사용 가능한 매니저 응답 (기본)
 */
export interface AvailableManagerResponse {
  uuid: string;
  name: string;
  averageRate: number;
  introduceText: string;
  profileImage : string; 
}

/**
 * 사용 가능한 매니저 (상세)
 */
export interface AvailableManager {
  uuid: string;
  name: string;
  profileImage?: string;
  averageRate: number;
  introduceText?: string;
  regions: string[];
  services: string[];
  schedules: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
  distance?: number; // km 단위
  responseTime?: number; // 평균 응답 시간 (분)
}

/**
 * 매칭 요청 목록 응답
 */
export interface MatchingRequestListResponse {
  reservationId: number;
  serviceType: string;
  detailServiceType: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  address: string;
  addressDetail: string;
  roomSize: number;
  pet: string;
  totalPrice: string;
}

/**
 * 매칭 응답
 */
export interface MatchingResponse {
  reservationId: number;
  managerId: number;
  matchingStatus: ReservationStatus;
}

/**
 * 매칭 상세 정보
 */
export interface MatchingDetail {
  id: number;
  reservationId: number;
  managerId: number;
  managerName: string;
  managerProfileImage?: string;
  managerPhoneNumber: string;
  status: MatchingStatus;
  serviceType: string;
  serviceDetailType: string;
  address: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 매칭 검색 필터
 */
export interface MatchingSearchFilter {
  status?: MatchingStatus;
  managerId?: number;
  serviceType?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 매칭 통계
 */
export interface MatchingStats {
  totalMatches: number;
  successfulMatches: number;
  failedMatches: number;
  averageMatchTime: number; // 분 단위
  managerAcceptanceRate: number; // 퍼센트
}

/**
 * 매칭 알고리즘 설정
 */
export interface MatchingAlgorithmConfig {
  maxDistance: number; // km
  preferredManagers: boolean;
  blacklistedManagers: boolean;
  priceWeight: number;
  ratingWeight: number;
  distanceWeight: number;
}

/**
 * 실시간 매칭 상태
 */
export interface RealTimeMatchingStatus {
  reservationId: number;
  status: 'SEARCHING' | 'FOUND' | 'CONFIRMED' | 'FAILED';
  foundManagers: AvailableManager[];
  estimatedTime?: number; // 예상 매칭 시간 (분)
  progress: number; // 0-100
}
