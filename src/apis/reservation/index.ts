import { apiCall, buildQueryString } from '../index';
import type {
  ReservationCreateRequest,
  ReservationListResponse,
  ReservationDetailResponse,
  ReservationApprovalRequest,
  PaymentRequestBody,
  CheckInOutRequest,
  ReviewRegisterRequest,
  WeeklySettlementResponse,
  PagingParams,
  PageResponse,
} from '@/types/reservation';
import { API_ENDPOINTS } from '@/constants/api';

export const reservationApi = {
  /**
   * 예약 생성
   */
  create: async (data: ReservationCreateRequest): Promise<string> => {
    return apiCall<string>('post', API_ENDPOINTS.RESERVATION.CREATE, data);
  },

  /**
   * 결제 금액 확인
   */
  checkPrice: async (data: ReservationCreateRequest): Promise<string> => {
    return apiCall<string>('post', API_ENDPOINTS.RESERVATION.PRICE_CHECK, data);
  },

  /**
   * 전체 예약 조회 (기존 - 하위 호환성)
   */
  getAllReservations: async (): Promise<ReservationListResponse[]> => {
    return apiCall<ReservationListResponse[]>(
      'get',
      API_ENDPOINTS.RESERVATION.LIST,
    );
  },

  /**
   * 페이징된 예약 조회 (새로운 API)
   */
  getReservationsPaginated: async (
    params: PagingParams = {},
  ): Promise<PageResponse<ReservationListResponse>> => {
    const defaultParams = {
      page: 0,
      size: 5,
      sortBy: 'reservationDate',
      sortOrder: 'DESC',
      ...params,
    };

    const queryString = buildQueryString(defaultParams);
    return apiCall<PageResponse<ReservationListResponse>>(
      'get',
      `/api/reservations/consumer${queryString}`,
    );
  },

  /**
   * 예약 상세 조회
   */
  getReservationDetail: async (
    reservationId: number,
  ): Promise<ReservationDetailResponse> => {
    return apiCall<ReservationDetailResponse>(
      'get',
      API_ENDPOINTS.RESERVATION.DETAIL(reservationId),
    );
  },

  /**
   * 예약 취소
   */
  cancel: async (reservationId: number): Promise<string> => {
    return apiCall<string>(
      'delete',
      API_ENDPOINTS.RESERVATION.CANCEL(reservationId),
    );
  },

  /**
   * 예약 결제
   */
  payment: async (data: PaymentRequestBody): Promise<string> => {
    return apiCall<string>('post', API_ENDPOINTS.RESERVATION.PAYMENT(), data);
  },

  /**
   * 예약 요청 응답 (매니저용)
   */
  respondToReservation: async (
    reservationId: number,
    data: ReservationApprovalRequest,
  ): Promise<string> => {
    return apiCall<string>(
      'post',
      API_ENDPOINTS.RESERVATION.RESPONSE(reservationId),
      data,
    );
  },

  /**
   * 체크인
   */
  checkIn: async (
    reservationId: number,
    data: CheckInOutRequest,
  ): Promise<string> => {
    return apiCall<string>(
      'post',
      API_ENDPOINTS.RESERVATION.CHECKIN(reservationId),
      data,
    );
  },

  /**
   * 체크아웃
   */
  checkOut: async (
    reservationId: number,
    data: CheckInOutRequest,
  ): Promise<string> => {
    return apiCall<string>(
      'post',
      API_ENDPOINTS.RESERVATION.CHECKOUT(reservationId),
      data,
    );
  },

  /**
   * 리뷰 등록
   */
  registerReview: async (data: ReviewRegisterRequest): Promise<string> => {
    return apiCall<string>('post', API_ENDPOINTS.RESERVATION.REVIEW(), data);
  },

  /**
   * 주간 정산 조회
   */
  getWeeklySettlements: async (
    startDate: string,
  ): Promise<WeeklySettlementResponse> => {
    const queryString = buildQueryString({ startDate });
    return apiCall<WeeklySettlementResponse>(
      'get',
      `${API_ENDPOINTS.RESERVATION.SETTLEMENTS}${queryString}`,
    );
  },
};
