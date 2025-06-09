import { apiClient, type ApiResponse, handleApiError } from '../index';

// 예약 관련 타입 정의
export interface ReservationRequestDto {
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

export interface ReservationResponseDto {
  reservationId: number;
  serviceType: string;
  detailServiceType: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
}

export interface ReservationDetailResponseDto {
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

export interface ReservationIsApprovedRequestDto {
  status: boolean;
}

export interface CheckInOutRequestDto {
  checkTime: string;
}

export interface ReviewRegisterRequestDto {
  rating: number;
  comment: string;
  likes: boolean;
}

export interface WeeklySettlementResponseDto {
  totalAmount: number;
  settlements: SettlementResponseDto[];
}

export interface SettlementResponseDto {
  settlementId: number;
  serviceType: 'HOUSEKEEPING' | 'CARE';
  serviceDetailType: string;
  status: string;
  platformFee: number;
  amount: number;
}

// 예약 API 함수들
export const reservationApi = {
  // 예약 생성
  create: async (data: ReservationRequestDto): Promise<string> => {
    try {
      const response = await apiClient.post<ApiResponse<string>>(
        '/api/reservations/register',
        data,
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 결제 금액 확인
  checkPrice: async (data: ReservationRequestDto): Promise<string> => {
    try {
      const response = await apiClient.post<ApiResponse<string>>(
        '/api/reservations/price',
        data,
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 전체 예약 조회
  getAllReservations: async (): Promise<ReservationResponseDto[]> => {
    try {
      const response =
        await apiClient.get<ReservationResponseDto[]>('/api/reservations');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 예약 상세 조회
  getReservationDetail: async (
    reservationId: number,
  ): Promise<ReservationDetailResponseDto> => {
    try {
      const response = await apiClient.get<ApiResponse<ReservationDetailResponseDto>>(
        `/api/reservations/${reservationId}`,
      );
      console.log('API 응답:', response);
      if (!response.data || !response.data.data) {
        throw new Error('API 응답 데이터가 없습니다.');
      }
      return response.data.data;
    } catch (error) {
      console.error('API 에러:', error);
      throw new Error(handleApiError(error));
    }
  },

  // 예약 취소
  cancel: async (reservationId: number): Promise<string> => {
    try {
      const response = await apiClient.delete<ApiResponse<string>>(
        `/api/reservations/${reservationId}/cancel`,
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 예약 요청 응답 (매니저용)
  respondToReservation: async (
    reservationId: number,
    data: ReservationIsApprovedRequestDto,
  ): Promise<string> => {
    try {
      const response = await apiClient.post<ApiResponse<string>>(
        `/api/reservations/${reservationId}/response`,
        data,
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 체크인
  checkIn: async (
    reservationId: number,
    data: CheckInOutRequestDto,
  ): Promise<string> => {
    try {
      const response = await apiClient.post<ApiResponse<string>>(
        `/api/reservations/${reservationId}/checkin`,
        data,
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 체크아웃
  checkOut: async (
    reservationId: number,
    data: CheckInOutRequestDto,
  ): Promise<string> => {
    try {
      const response = await apiClient.post<ApiResponse<string>>(
        `/api/reservations/${reservationId}/checkout`,
        data,
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 리뷰 등록
  registerReview: async (
    reservationId: number,
    data: ReviewRegisterRequestDto,
  ): Promise<string> => {
    try {
      const response = await apiClient.post<ApiResponse<string>>(
        `/api/reservations/${reservationId}/review`,
        data,
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 주간 정산 조회
  getWeeklySettlements: async (
    startDate: string,
  ): Promise<WeeklySettlementResponseDto> => {
    try {
      const response = await apiClient.get<WeeklySettlementResponseDto>(
        `/api/reservations/settlements/weekly-details?startDate=${startDate}`,
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
