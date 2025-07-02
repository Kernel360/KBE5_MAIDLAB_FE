import { apiClient, handleApiError, apiCall, buildQueryString } from '../index';
import type { ApiResponse } from '@/types/api';
import type { LoginResponse } from '@/types/auth';
import type {
  ReservationListResponse,
  ReservationDetailResponse,
} from '@/types/reservation';
import type { MatchingResponse } from '@/types/matching';
import type { BoardResponse, BoardDetailResponse, BoardListResponse } from '@/types/board';
import type {
  AdminLoginRequest,
  AdminPageParams,
  ManagerListResponse,
  AdminManagerDetail,
  ConsumerListResponse,
  AdminWeeklySettlementResponse,
  AdminAnswerRequest,
  ManagerStatusParams,
  SettlementDetailInfo,
  ManagerChangeRequest,
  ConsumerProfileDetail,
} from '@/types/admin';
import { API_ENDPOINTS } from '@/constants/api';

export const adminApi = {
  // ===== 인증 관련 =====
  /**
   * 관리자 로그인
   */
  login: async (data: AdminLoginRequest): Promise<LoginResponse> => {
    return apiCall<LoginResponse>('post', API_ENDPOINTS.ADMIN.AUTH.LOGIN, data);
  },

  /**
   * 관리자 토큰 갱신
   */
  refreshToken: async (): Promise<LoginResponse> => {
    return apiCall<LoginResponse>('post', API_ENDPOINTS.ADMIN.AUTH.REFRESH);
  },

  /**
   * 관리자 로그아웃
   */
  logout: async (): Promise<void> => {
    return apiCall<void>('post', API_ENDPOINTS.ADMIN.AUTH.LOGOUT);
  },

  // ===== 매니저 관리 =====
  /**
   * 매니저 계정 조회
   */
  getManagers: async (
    params: AdminPageParams = {},
  ): Promise<ManagerListResponse> => {
    const { page = 0, size = 10, search = '' } = params;
    const queryString = buildQueryString({ page, size, search });
    return apiCall<ManagerListResponse>(
      'get',
      `${API_ENDPOINTS.ADMIN.MANAGER.LIST}${queryString}`,
    );
  },

  /**
   * 매니저 상세 조회
   */
  getManager: async (managerId: number): Promise<AdminManagerDetail> => {
    return apiCall<AdminManagerDetail>(
      'get',
      API_ENDPOINTS.ADMIN.MANAGER.DETAIL(managerId),
    );
  },

  /**
   * 매니저 승인
   */
  approveManager: async (managerId: number): Promise<string> => {
    return apiCall<string>(
      'patch',
      API_ENDPOINTS.ADMIN.MANAGER.APPROVE(managerId),
    );
  },

  /**
   * 매니저 거절
   */
  rejectManager: async (managerId: number): Promise<string> => {
    return apiCall<string>(
      'patch',
      API_ENDPOINTS.ADMIN.MANAGER.REJECT(managerId),
    );
  },

  /**
   * 매니저 상태별 조회
   */
  getManagersByStatus: async (
    params: ManagerStatusParams,
  ): Promise<ApiResponse<ManagerListResponse>> => {
    const { page = 0, size = 10, status , sortByRating, isDescending} = params;
    const queryString = buildQueryString({ page, size, status, sortByRating, isDescending });

    // 특별히 이 API만 전체 응답이 필요한 경우
    try {
      const response = await apiClient.get<ApiResponse<ManagerListResponse>>(
        `${API_ENDPOINTS.ADMIN.MANAGER.STATUS}${queryString}`,
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ===== 소비자 관리 =====
  /**
   * 소비자 계정 조회
   */
  getConsumers: async (
    params: AdminPageParams = {},
  ): Promise<ConsumerListResponse> => {
    const { page = 0, size = 10 } = params;
    const queryString = buildQueryString({ page, size });
    return apiCall<ConsumerListResponse>(
      'get',
      `${API_ENDPOINTS.ADMIN.CONSUMER.LIST}${queryString}`,
    );
  },

  /**
   * 소비자 상세 조회
   */
  getConsumer: async (consumerId: number): Promise<ConsumerProfileDetail> => {
    return apiCall<ConsumerProfileDetail>(
      'get',
      API_ENDPOINTS.ADMIN.CONSUMER.DETAIL(consumerId),
    );
  },

  // ===== 예약 관리 =====
  /**
   * 전체 예약 조회
   */
  getReservations: async (
    params: AdminPageParams = {},
  ): Promise<ReservationListResponse[]> => {
    const { page = 0, size = 10 } = params;
    const queryString = buildQueryString({ page, size });
    return apiCall<ReservationListResponse[]>(
      'get',
      `${API_ENDPOINTS.ADMIN.RESERVATION.LIST}${queryString}`,
    );
  },

  /**
   * 예약 상세 조회
   */
  getReservation: async (
    reservationId: number,
  ): Promise<ReservationDetailResponse> => {
    return apiCall<ReservationDetailResponse>(
      'get',
      API_ENDPOINTS.ADMIN.RESERVATION.DETAIL(reservationId),
    );
  },

  /**
   * 수요자별 예약 조회
   */

    getConsumerReservations: async (
    consumerId: number, 
    params: AdminPageParams = {}
  ): Promise<ReservationListResponse[]> => {
    const { page = 0, size = 10} = params;
    const queryString = buildQueryString({ page, size })
    return apiCall<ReservationListResponse[]>(
      'get',
      `${API_ENDPOINTS.ADMIN.RESERVATION.CONSUMER(consumerId)}${queryString}`,
    );
  },


  /**
   * 수요자별 예약 조회
   */

    getManagerReservations: async (
    managerId: number, 
    params: AdminPageParams = {}
  ): Promise<ReservationListResponse[]> => {
    const { page = 0, size = 10} = params;
    const queryString = buildQueryString({ page, size })
    return apiCall<ReservationListResponse[]>(
      'get',
      `${API_ENDPOINTS.ADMIN.RESERVATION.MANAGER(managerId)}${queryString}`,
    );
  },

  /**
   * 일별 예약 조회
   */
  getDailyReservations: async (
    date: string,
    params: AdminPageParams = {},
  ): Promise<ReservationListResponse[]> => {
    const { page = 0, size = 10 } = params;
    const queryString = buildQueryString({ date, page, size });
    return apiCall<ReservationListResponse[]>(
      'get',
      `${API_ENDPOINTS.ADMIN.RESERVATION.DAILY}${queryString}`,
    );
  },

  /**
   * 주간 정산 조회
   */
  getWeeklySettlements: async (
    startDate: string,
    params: AdminPageParams = {},
  ): Promise<AdminWeeklySettlementResponse> => {
    const { page = 0, size = 10 } = params;
    const queryString = buildQueryString({ startDate, page, size });
    return apiCall<AdminWeeklySettlementResponse>(
      'get',
      `${API_ENDPOINTS.ADMIN.RESERVATION.SETTLEMENTS}${queryString}`,
    );
  },

  // ===== 매칭 관리 =====
  /**
   * 전체 매칭 조회
   */
  getAllMatching: async (
    params: AdminPageParams = {},
  ): Promise<MatchingResponse[]> => {
    const { page = 0, size = 10 } = params;
    const queryString = buildQueryString({ page, size });
    return apiCall<MatchingResponse[]>(
      'get',
      `${API_ENDPOINTS.ADMIN.MATCHING.LIST}${queryString}`,
    );
  },

  /**
   * 상태별 매칭 조회
   */
  getMatchingByStatus: async (
    status: string,
    params: AdminPageParams = {},
  ): Promise<MatchingResponse[]> => {
    const { page = 0, size = 10 } = params;
    const queryString = buildQueryString({ status, page, size });
    return apiCall<MatchingResponse[]>(
      'get',
      `${API_ENDPOINTS.ADMIN.MATCHING.STATUS}${queryString}`,
    );
  },

  /**
   * 매니저 변경
   */
  changeManager: async (data: ManagerChangeRequest): Promise<string> => {
    const queryString = buildQueryString({
      reservationId: data.reservationId,
      managerId: data.managerId,
    });
    return apiCall<string>(
      'patch',
      `${API_ENDPOINTS.ADMIN.MATCHING.CHANGE_MANAGER}${queryString}`,
    );
  },

  // ===== 게시판 관리 =====
  /**
   * 전체 게시판 조회
   */
  getBoards: async (params: AdminPageParams = {}): Promise<BoardResponse[]> => {
    const { page = 0, size = 10 } = params;
    const queryString = buildQueryString({ page, size });
    return apiCall<BoardResponse[]>(
      'get',
      `${API_ENDPOINTS.ADMIN.BOARD.LIST}${queryString}`,
    );
  },

  /**
   * 상담 게시판 조회
   */
  getConsultationBoards: async (params: AdminPageParams = {}): Promise<BoardListResponse> => {
    const { page = 0, size = 10 } = params;
    const queryString = buildQueryString({ page, size });
    return apiCall<BoardListResponse>(
      'get',
      `${API_ENDPOINTS.ADMIN.BOARD.CONSULTATION}${queryString}`,
    );
  },

  /**
   * 환불 게시판 조회
   */
  getRefundBoards: async (params: AdminPageParams = {}): Promise<BoardListResponse> => {
    const { page = 0, size = 10 } = params;
    const queryString = buildQueryString({ page, size });
    return apiCall<BoardListResponse>('get', `${API_ENDPOINTS.ADMIN.BOARD.REFUND}${queryString}`);
  },

  /**
   * 게시판 상세 조회
   */
  getBoardDetail: async (boardId: number): Promise<BoardDetailResponse> => {
    return apiCall<BoardDetailResponse>(
      'get',
      API_ENDPOINTS.ADMIN.BOARD.DETAIL(boardId),
    );
  },

  /**
   * 답변 등록
   */
  createAnswer: async (
    boardId: number,
    data: AdminAnswerRequest,
  ): Promise<string> => {
    return apiCall<string>(
      'post',
      API_ENDPOINTS.ADMIN.BOARD.UPDATE_ANSWER(boardId),
      data,
    );
  },

  /**
   * 답변 수정
   */
  updateAnswer: async (
    boardId: number,
    data: AdminAnswerRequest,
  ): Promise<string> => {
    return apiCall<string>(
      'patch',
      API_ENDPOINTS.ADMIN.BOARD.UPDATE_ANSWER(boardId),
      data,
    );
  },

  /**
   * 정산 상세 조회
   */
  getSettlementDetail: async (
    settlementId: number,
  ): Promise<SettlementDetailInfo> => {
    return apiCall<SettlementDetailInfo>(
      'get',
      API_ENDPOINTS.ADMIN.RESERVATION.SETTLEMENT_DETAIL(settlementId),
    );
  },

  /**
   * 정산 승인
   */
  approveSettlement: async (settlementId: number): Promise<string> => {
    return apiCall<string>(
      'patch',
      API_ENDPOINTS.ADMIN.RESERVATION.SETTLEMENT_APPROVE(settlementId),
    );
  },

  /**
   * 정산 거부
   */
  rejectSettlement: async (settlementId: number): Promise<string> => {
    return apiCall<string>(
      'patch',
      API_ENDPOINTS.ADMIN.RESERVATION.SETTLEMENT_REJECT(settlementId),
    );
  },
  //대시보드용 조회 api들
  getManagerCount: async (): Promise<string> => {
    return apiCall<string>(
      'get',
      `${API_ENDPOINTS.ADMIN.MANAGER.GETCOUNT}`,
    )
  },
  getNewManagerCount: async (): Promise<string> => {
    return apiCall<string>(
      'get',
      `${API_ENDPOINTS.ADMIN.MANAGER.NEWMANAGERCOUNT}`,
    )
  },
  
  getConsumerCount: async (): Promise<string> => {
    return apiCall<string>(
      'get',
      `${API_ENDPOINTS.ADMIN.CONSUMER.GETCOUNT}`,
    )
  },  
  getTodayReservationCount: async (): Promise<string> => {
    return apiCall<string>(
      'get',
      `${API_ENDPOINTS.ADMIN.RESERVATION.GETTODAYCOUNT}`,
    )
  },
  getEventCount: async (): Promise<string> => {
    return apiCall<string>(
      'get',
      `${API_ENDPOINTS.EVENT.GETCOUNT}`,
    )
  },
  getBoardWithoutAnswerCount: async (): Promise<string> => {
    return apiCall<string>(
      'get',
      `${API_ENDPOINTS.ADMIN.BOARD.GETWITHOUTANSWERCOUNT}`,
    )
  },

  /**
   * 소비자별 총 예약 건수 조회
   */
  getTotalReservationCount: async (consumerId: number): Promise<number> => {
    return apiCall<number>(
      'get',
      `/api/admin/reservations/reservationcount/${consumerId}`,
    );
  },

  /**
   * 소비자별 리뷰 작성률 조회
   */
  getReviewPercent: async (consumerId: number): Promise<number> => {
    return apiCall<number>(
      'get',
      `/api/admin/reservations/reviewedpercent/${consumerId}`,
    );
  },

  /**
   * 소비자별 총 결제 금액 조회
   */
  getTotalPaidMoney: async (consumerId: number): Promise<number> => {
    return apiCall<number>(
      'get',
      `/api/admin/reservations/totalpaidmoney/${consumerId}`,
    );
  },

  /**
   * 매니저별 총 매칭 건수 조회
   */
  getMatchedCount: async (managerId: number): Promise<number> => {
    return apiCall<number>(
      'get',
      `/api/admin/reservations/matchedcount/${managerId}`,
    );
  },

  /**
   * 매니저별 총 수익 금액 조회
   */
  getManagerSettlementSum: async (managerId: number): Promise<number> => {
    return apiCall<number>(
      'get',
      `/api/admin/reservations/manager/settlementsum/${managerId}`,
    );
  },

  /**
   * 매니저별 리뷰 작성률 조회
   */
  getManagerReviewPercent: async (managerId: number): Promise<number> => {
    return apiCall<number>(
      'get',
      `/api/admin/reservations/managerreviewedpercent/${managerId}`,
    );
  },

  /**
   * 관리자 로그 조회 (최근 활동)
   */
  getAdminLogs: async (lines: number = 50): Promise<string[]> => {
    return apiCall<string[]>(
      'get',
      `api/admin/logs/tail?lines=${lines}`,
    );
  },

};
