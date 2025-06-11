import { apiClient, type ApiResponse, handleApiError } from '../index';

// 매칭 관련 타입 정의
export interface MatchingRequestDto {
  address: string;
  startTime: string;
  endTime: string;
  managerChoose: boolean;
}

export interface AvailableManagerResponseDto {
  uuid: string;
  name: string;
}

export interface RequestMatchingListResponseDto {
  reservationId: number;
  serviceType: string;
  detailServiceType: string;
  reservationDate: string;
  startTime : string;
  endTime: string;
  address: string;
  addressDetail: string;
  roomSize : number
  pet: string;
  totalPrice: string;
}

// 매칭 API 함수들
export const matchingApi = {
  // 매칭 매니저 조회
  getMatchingManagers: async (
    data: MatchingRequestDto,
  ): Promise<AvailableManagerResponseDto[]> => {
    try {
      const response = await apiClient.post<AvailableManagerResponseDto[]>(
        '/api/matching/matchmanager',
        data,
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 매칭 시작
  startMatch: async (
    reservationId: number,
    managerId: number,
  ): Promise<string> => {
    try {
      const response = await apiClient.post<ApiResponse<string>>(
        `/api/matching/matchstart?reservation_id=${reservationId}&manager_id=${managerId}`,
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 매칭 조회
  getMatching: async (
    page: number,
    size: number,
  ): Promise<RequestMatchingListResponseDto[]> => {
    try {
      const response = await apiClient.get<ApiResponse<RequestMatchingListResponseDto[]>>(
        `/api/matching?page=${page}&size=${size}`,
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
