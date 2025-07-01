import type { ReservationStatus } from '@/constants/status';
import type { HousingType, PetType, ServiceType } from '@/constants/service';

/**
 * 예약 생성 요청 (통합)
 */
export interface ReservationCreateRequest {
  serviceDetailTypeId: number;
  address: string;
  addressDetail: string;
  managerUuId: string;
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
  managerUuId: string;
  managerName: string;
  managerProfileImageUrl: string;
  managerAverageRate: number;
  managerRegion: string[];
  managerPhoneNumber: string;
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
}

/**
 * 예약 승인/거절 요청
 */
export interface ReservationApprovalRequest {
  status: boolean;
}

/**
 * 체크인/체크아웃 요청
 */
export interface CheckInOutRequest {
  checkTime: string;
}

/**
 * 리뷰 등록 요청
 */
export interface ReviewRegisterRequest {
  rating: number;
  comment: string;
  keywords : string[];
  likes?: boolean;
}

/**
 * 리뷰 정보
 */
export interface Review {
  reviewId: string;
  rating: number;
  name: string;
  comment: string;
  serviceType: string;
  serviceDetailType: string;
  createdAt: string;
}

/**
 * 리뷰 목록 응답
 */
export interface ReviewListResponse {
  reviews: Review[];
}

/**
 * 정산 응답
 */
export interface SettlementResponse {
  settlementId: number;
  reservationId: number;
  serviceType: ServiceType;
  serviceDetailType: string;
  status: string;
  platformFee: number;
  amount: number;
}

/**
 * 주간 정산 응답 (통합)
 */
export interface WeeklySettlementResponse {
  totalAmount: number;
  settlements: SettlementResponse[];
}

/**
 * 예약 폼 데이터
 */
export interface ReservationFormData {
  serviceType: string;
  serviceDetailType: string;
  address: string;
  addressDetail: string;
  housingType: HousingType;
  reservationDate: string;
  startTime: string;
  endTime: string;
  pet: PetType;
  managerUuId?: string;
  chooseManager: boolean; // 직접 선택 여부
  // 생활청소 평수 인덱스
  lifeCleaningRoomIdx?: number;
  // 추가 서비스 옵션 (id, count)
  serviceOptions?: { id: string; count?: number }[];
  housingInformation: string;
  specialRequest: string;
  managerInfo?: {
    uuid: string;
    name: string;
    profileImage?: string;
    averageRate?: number;
    introduceText?: string;
  };
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
