import type { ReservationStatus } from '@/constants/status';
import type { PaginationParams } from '../api';

/**
 * 예약 페이징 요청 파라미터
 */
export interface ReservationPagingParams extends PaginationParams {
  status?: ReservationStatus;
  sortBy?:
    | 'createdAt'
    | 'reservationDate'
    | 'totalPrice'
    | 'completedAt'
    | 'startTime';
}

/**
 * 페이징 응답 (Spring Data Page)
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * 예약 생성 요청 (통합)
 */
export interface ReservationCreateRequest {
  serviceDetailTypeId: number;
  address: string;
  addressDetail: string;
  managerUuid: string;
  housingType: string;
  lifeCleaningRoomIdx?: number;
  housingInformation: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  serviceOptions?: { id: string; count?: number }[];
  pet: string;
  specialRequest: string;
  totalPrice: number;
}

/**
 * 예약 목록 응답 (통합)
 */
export interface ReservationListResponse {
  reservationId: number;
  status: ReservationStatus;
  serviceType: string;
  detailServiceType: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  isExistReview: boolean;
  totalPrice: number;
}

/**
 * 예약 상세 응답
 */
export interface ReservationDetailResponse {
  status: string;
  serviceType: string;
  serviceDetailType: string;
  address: string;
  addressDetail: string;
  housingType: string;
  roomSize: number;
  housingInformation: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  serviceAdd: string;
  pet: string;
  specialRequest: string;
  totalPrice: number;
  canceledAt: string | null;
  checkinTime: string | null;
  checkoutTime: string | null;
  consumerId: number;
  managerId: number;
  managerName: string;
  managerProfileImage: string;
  managerRate: string;
  consumerName: string;
  consumerProfileImage: string;
  managerPhoneNumber: string;
  consumerPhoneNumber: string;
  managerUuid: string;
  managerProfileImageUrl: string;
  managerAverageRate: number;
  managerRegion: string[];
}

/**
 * 예약 승인/거절 요청
 */
export interface ReservationApprovalRequest {
  status: boolean;
}

/**
 * 결제 요청
 */
export interface PaymentRequestBody {
  reservationId: number;
}

/**
 * 체크인/체크아웃 요청
 */
export interface CheckInOutRequest {
  checkTime: string;
}

/**
 * 예약 검색 필터
 */
export interface ReservationSearchFilter {
  keyword?: string;
  status?: ReservationStatus;
  serviceType?: string;
  startDate?: string;
  endDate?: string;
  managerId?: number;
  consumerId?: number;
}

/**
 * 예약 통계
 */
export interface ReservationStats {
  totalReservations: number;
  completedReservations: number;
  canceledReservations: number;
  averageRating: number;
  totalRevenue: number;
  statusBreakdown: Record<ReservationStatus, number>;
}

// Re-export from forms for backward compatibility
export type { ReservationFormData } from '@/types/forms/reservationForm';

// Re-export from settlement for backward compatibility
export type {
  SettlementResponse,
  WeeklySettlementResponse,
} from '@/types/domain/settlement';

// Alias for backward compatibility
export type ReservationItem = ReservationListResponse;

/**
 * 예약 목록 UI에서 사용하는 탭 종류
 */
export type ReservationTab = 'scheduled' | 'today' | 'completed';
