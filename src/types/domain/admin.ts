import type { Gender } from '@/constants';
import type { PaginationResponse } from '../api';
import type { ManagerVerificationStatus } from '@/constants/status';

/**
 * 관리자 로그인 요청
 */
export interface AdminLoginRequest {
  adminKey: string;
  password: string;
}

/**
 * 페이지 파라미터
 */
export interface AdminPageParams {
  page?: number;
  size?: number;
  search?: string;
}

/**
 * 매니저 목록 아이템
 */
export interface ManagerListItem {
  name: string;
  uuid: string;
  id: number;
}

/**
 * 매니저 목록 응답
 */
export interface ManagerListResponse
  extends PaginationResponse<ManagerListItem> {}

/**
 * 매니저 상세 정보 (관리자용)
 */
export interface AdminManagerDetail {
  id: number;
  phoneNumber: string;
  name: string;
  birth: string;
  gender: Gender;
  averageRate: number;
  createdAt: string;
  updatedAt: string;
  introduceText: string;
  profileImage: string;
  socialType: string;
  region: string[];
  isVerified: string;
  isDeleted: boolean;
}

/**
 * 소비자 목록 아이템
 */
export interface ConsumerListItem {
  id: number;
  phoneNumber: string;
  name: string;
  uuid: string;
}

/**
 * 소비자 목록 응답
 */
export interface ConsumerListResponse
  extends PaginationResponse<ConsumerListItem> {}

// 소비자 상세 정보
export interface ConsumerProfileDetail {
  profileImage: string;
  phoneNumber: string;
  name: string;
  birth: string; // 'YYYY-MM-DD' 형식의 문자열로 받는다고 가정
  gender: Gender;
  address: string;
  detailAddress: string;
  point: number;
  isDeleted: boolean;
  socialType: string;
}
/**
 * 관리자용 정산 정보 (통합)
 */
export interface AdminSettlement {
  managerName: string;
  serviceType: 'HOUSEKEEPING' | 'CARE';
  status: string;
  amount: number;
  createdAt: string;
  serviceDetailType: string;
  settlementId: number;
}

/**
 * 관리자용 주간 정산 응답 (통합)
 */
export interface AdminWeeklySettlementResponse {
  totalAmount: number;
  settlements: PaginationResponse<AdminSettlement>;
}

/**
 * 정산 상세 정보
 */
export interface SettlementDetailInfo {
  settlementId: number;
  serviceType: 'HOUSEKEEPING';
  serviceDetailType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  platformFee: number;
  amount: number;
}

/**
 * 정산 상세 응답
 */
export interface SettlementDetailResponse {
  data: SettlementDetailInfo;
  message: string;
  code: string;
}

/**
 * 관리자 답변 요청
 */
export interface AdminAnswerRequest {
  content: string;
}

/**
 * 관리자 답변 응답
 */
export interface AdminAnswerResponse {
  content: string;
}

/**
 * 매니저 상태별 조회 파라미터
 */
export interface ManagerStatusParams {
  page?: number;
  size?: number;
  status: string;
  sortByRating?: boolean;
  isDescending?: boolean;
}

/**
 * 매니저 변경 요청
 */
export interface ManagerChangeRequest {
  reservationId: number;
  managerId: number;
}

/**
 * 관리자 검색 필터
 */
export interface AdminSearchFilter {
  keyword?: string;
  status?: string;
  serviceType?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 관리자 통계 정보
 */
export interface AdminStats {
  totalManagers: number;
  pendingManagers: number;
  approvedManagers: number;
  totalConsumers: number;
  totalReservations: number;
  totalRevenue: number;
}
export type BoardType = 'REFUND' | 'MANAGER' | 'SERVICE' | 'ETC';

export type TabType = 'consultation' | 'refund';

export interface UploadResult {
  originalName: string;
  storedKey: string;
  size: number;
  type: string;
}

export interface PresignedUrlResponse {
  url: string;
  key: string;
}

/**
 * 매니저 상태 필터 타입
 */
export type ManagerStatusFilter = ManagerVerificationStatus | 'ALL';
