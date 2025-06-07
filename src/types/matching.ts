import type { ReservationStatus } from './reservation';

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
 * 사용 가능한 매니저 응답
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
 * 매칭 상태 (ReservationStatus와 동일)
 */
export type MatchingStatus = ReservationStatus;

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
 * 매니저 변경 요청
 */
export interface ManagerChangeRequest {
  reservationId: number;
  newManagerId: number;
  reason?: string;
}
