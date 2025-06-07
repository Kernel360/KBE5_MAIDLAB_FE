/**
 * 예약 상태
 */
export type ReservationStatus =
  | 'PENDING' // 대기중
  | 'APPROVED' // 승인됨
  | 'REJECTED' // 거절됨
  | 'MATCHED' // 매칭됨
  | 'WORKING' // 진행중
  | 'CANCELED' // 취소됨
  | 'FAILURE' // 실패
  | 'COMPLETED'; // 완료

/**
 * 주거 타입
 */
export type HousingType = 'APT' | 'VILLA' | 'HOUSE' | 'OFFICETEL';

/**
 * 반려동물 타입
 */
export type PetType = 'NONE' | 'DOG' | 'CAT' | 'ETC';

/**
 * 예약 요청
 */
export interface ReservationRequest {
  serviceDetailTypeId: number;
  address: string;
  addressDetail: string;
  managerUuId: string;
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
 * 예약 응답 (목록용)
 */
export interface ReservationResponse {
  reservationId: number;
  serviceType: string;
  detailServiceType: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
}

/**
 * 예약 상세 응답
 */
export interface ReservationDetailResponse {
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
  likes: boolean;
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
}

/**
 * 리뷰 목록 응답
 */
export interface ReviewListResponse {
  reviews: Review[];
}

/**
 * 정산 정보
 */
export interface Settlement {
  settlementId: number;
  serviceType: 'HOUSEKEEPING' | 'CARE';
  serviceDetailType: string;
  status: ReservationStatus;
  platformFee: number;
  amount: number;
}

/**
 * 주간 정산 응답
 */
export interface WeeklySettlementResponse {
  totalAmount: number;
  settlements: Settlement[];
}

/**
 * 관리자용 정산 정보
 */
export interface AdminSettlement {
  managerName: string;
  serviceType: 'HOUSEKEEPING' | 'CARE';
  status: ReservationStatus;
  amount: number;
  createdAt: string;
  serviceDetailType: string;
  settlementId: number;
}

/**
 * 관리자용 주간 정산 응답
 */
export interface AdminWeeklySettlementResponse {
  totalAmount: number;
  settlements: {
    totalPages: number;
    totalElements: number;
    size: number;
    content: AdminSettlement[];
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
  };
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
  roomSize: number;
  housingInformation: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  serviceAdd: string;
  pet: PetType;
  specialRequest: string;
  managerUuId?: string;
  chooseManager: boolean; // 직접 선택 여부
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
