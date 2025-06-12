import { apiClient, type ApiResponse, handleApiError } from '../index';
import type { LoginResponseDto } from '../auth';
import type {
  ReservationResponseDto,
  ReservationDetailResponseDto,
} from '../reservation';
import type { MatchingResponseDto } from '../matching';
import type { ConsumerProfileResponseDto } from '../consumer';
import type { 
  ImageDto,
  ConsumerBoardResponseDto,
  ConsumerBoardDetailResponseDto,
  AnswerRequestDto 
} from '../board';

// 관리자 관련 타입 정의
export interface AdminLoginRequestDto {
  adminKey: string;
  password: string;
}

export interface PageParams {
  page?: number;
  size?: number;
  search?: string;
}

export interface ManagerListResponseDto {
  name: string;
  uuid: string;
  id: number;
}

export interface PageManagerListResponseDto {
  totalPages: number;
  totalElements: number;
  size: number;
  content: ManagerListResponseDto[];
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ManagerResponseDto {
  uuid: string;
  phoneNumber: string;
  name: string;
  birth: string;
  gender: 'MALE' | 'FEMALE';
  averageRate: number;
  region: string[];
  isVerified: string;
  isDeleted: boolean;
}

export interface ConsumerListResponseDto {
  id: number;
  phoneNumber: string;
  name: string;
  uuid: string;
}

export interface PageConsumerListResponseDto {
  totalPages: number;
  totalElements: number;
  size: number;
  content: ConsumerListResponseDto[];
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface AdminSettlementResponseDto {
  managerName: string;
  serviceType: 'HOUSEKEEPING' | 'CARE';
  status: string;
  amount: number;
  createdAt: string;
  serviceDetailType: string;
  settlementId: number;
}

export interface AdminWeeklySettlementResponseDto {
  totalAmount: number;
  settlements: {
    totalPages: number;
    totalElements: number;
    size: number;
    content: AdminSettlementResponseDto[];
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
  };
}

// 게시판 관련 타입 정의
export interface AnswerResponseDto {
  content: string;
}

// 관리자 API 함수들
export const adminApi = {
  // ===== 인증 관련 =====
  // 관리자 로그인
  login: async (data: AdminLoginRequestDto): Promise<LoginResponseDto> => {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponseDto>>(
        '/api/admin/auth/login',
        data,
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 관리자 토큰 갱신
  refreshToken: async (): Promise<LoginResponseDto> => {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponseDto>>(
        '/api/admin/auth/refresh',
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 관리자 로그아웃
  logout: async (): Promise<void> => {
    try {
      await apiClient.post<ApiResponse<void>>('/api/admin/auth/logout');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ===== 매니저 관리 =====
  // 매니저 계정 조회
  getManagers: async (
    params: PageParams = {},
  ): Promise<PageManagerListResponseDto> => {
    const { page = 0, size = 10, search = '' } = params;
    try {
      const response = await apiClient.get<
        ApiResponse<PageManagerListResponseDto>
      >(`/api/admin/manager?page=${page}&size=${size}${search ? `&search=${encodeURIComponent(search)}` : ''}`);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 매니저 상세 조회
  getManager: async (managerId: number): Promise<ManagerResponseDto> => {
    try {
      const response = await apiClient.get<ApiResponse<ManagerResponseDto>>(
        `/api/admin/manager/${managerId}`,
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 매니저 승인
  approveManager: async (managerId: number): Promise<string> => {
    try {
      const response = await apiClient.patch<ApiResponse<string>>(
        `/api/admin/manager/${managerId}/approve`,
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 매니저 거절
  rejectManager: async (managerId: number): Promise<string> => {
    try {
      const response = await apiClient.patch<ApiResponse<string>>(
        `/api/admin/manager/${managerId}/reject`,
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 매니저 상태별 조회
  getManagersByStatus: async (
    params: { page?: number; size?: number; status: string },
  ): Promise<ApiResponse<PageManagerListResponseDto>> => {
    const { page = 0, size = 10, status } = params;
    try {
      const response = await apiClient.get<ApiResponse<PageManagerListResponseDto>>(
        `/api/admin/manager/status?page=${page}&size=${size}&status=${status}`,
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ===== 소비자 관리 =====
  // 소비자 계정 조회
  getConsumers: async (
    params: PageParams = {},
  ): Promise<PageConsumerListResponseDto> => {
    const { page = 0, size = 10 } = params;
    try {
      const response = await apiClient.get<
        ApiResponse<PageConsumerListResponseDto>
      >(`/api/admin/consumer?page=${page}&size=${size}`);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 소비자 상세 조회
  getConsumer: async (
    consumerId: number,
  ): Promise<ConsumerProfileResponseDto> => {
    try {
      const response = await apiClient.get<ConsumerProfileResponseDto>(
        `/api/admin/consumer/${consumerId}`,
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ===== 예약 관리 =====
  // 전체 예약 조회
  getReservations: async (
    params: PageParams = {},
  ): Promise<ReservationResponseDto[]> => {
    const { page = 0, size = 10 } = params;
    try {
      const response = await apiClient.get<
        ApiResponse<ReservationResponseDto[]>
      >(`/api/admin/reservations?page=${page}&size=${size}`);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 예약 상세 조회
  getReservation: async (
    reservationId: number,
  ): Promise<ReservationDetailResponseDto> => {
    try {
      const response = await apiClient.get<
        ApiResponse<ReservationDetailResponseDto>
      >(`/api/admin/reservations/${reservationId}`);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 일별 예약 조회
  getDailyReservations: async (
    date: string,
    params: PageParams = {},
  ): Promise<ReservationResponseDto[]> => {
    const { page = 0, size = 10 } = params;
    try {
      const response = await apiClient.get<
        ApiResponse<ReservationResponseDto[]>
      >(`/api/admin/reservations/date?date=${date}&page=${page}&size=${size}`);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 주간 정산 조회
  getWeeklySettlements: async (
    startDate: string,
    params: PageParams = {},
  ): Promise<AdminWeeklySettlementResponseDto> => {
    const { page = 0, size = 10 } = params;
    try {
      const response = await apiClient.get<
        ApiResponse<AdminWeeklySettlementResponseDto>
      >(
        `/api/admin/reservations/settlements/weekly?startDate=${startDate}&page=${page}&size=${size}`,
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ===== 매칭 관리 =====
  // 전체 매칭 조회
  getAllMatching: async (
    params: PageParams = {},
  ): Promise<MatchingResponseDto[]> => {
    const { page = 0, size = 10 } = params;
    try {
      const response = await apiClient.get<ApiResponse<MatchingResponseDto[]>>(
        `/api/admin/matching?page=${page}&size=${size}`,
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 상태별 매칭 조회
  getMatchingByStatus: async (
    status: string,
    params: PageParams = {},
  ): Promise<MatchingResponseDto[]> => {
    const { page = 0, size = 10 } = params;
    try {
      const response = await apiClient.get<ApiResponse<MatchingResponseDto[]>>(
        `/api/admin/matching/status?status=${status}&page=${page}&size=${size}`,
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 매니저 변경
  changeManager: async (
    reservationId: number,
    managerId: number,
  ): Promise<string> => {
    try {
      const response = await apiClient.patch<ApiResponse<string>>(
        `/api/admin/matching/managerchange?reservationId=${reservationId}&managerId=${managerId}`,
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ===== 게시판 관리 =====
  // 전체 게시판 조회
  getBoards: async (
    params: PageParams = {},
  ): Promise<ConsumerBoardResponseDto[]> => {
    const { page = 0, size = 10 } = params;
    try {
      const response = await apiClient.get<
        ApiResponse<ConsumerBoardResponseDto[]>
      >(`/api/admin/board?page=${page}&size=${size}`);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 상담 게시판 조회
  getConsultationBoards: async (): Promise<ConsumerBoardResponseDto[]> => {
    try {
      const response = await apiClient.get<ApiResponse<ConsumerBoardResponseDto[]>>(
        '/api/admin/board/consultation',
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 환불 게시판 조회
  getRefundBoards: async (): Promise<ConsumerBoardResponseDto[]> => {
    try {
      const response = await apiClient.get<ApiResponse<ConsumerBoardResponseDto[]>>(
        '/api/admin/board/refund',
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 게시판 상세 조회
  getBoardDetail: async (
    boardId: number,
  ): Promise<ConsumerBoardDetailResponseDto> => {
    try {
      const response = await apiClient.get<
        ApiResponse<ConsumerBoardDetailResponseDto>
      >(`/api/admin/board/${boardId}`);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 답변 등록
  createAnswer: async (
    boardId: number,
    data: AnswerRequestDto,
  ): Promise<string> => {
    try {
      const response = await apiClient.post<ApiResponse<string>>(
        `/api/admin/board/answer?boardId=${boardId}`,
        data,
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 답변 수정
  updateAnswer: async (
    answerId: number,
    data: AnswerRequestDto,
  ): Promise<string> => {
    try {
      const response = await apiClient.patch<ApiResponse<string>>(
        `/api/admin/board/answer/${answerId}`,
        data,
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};