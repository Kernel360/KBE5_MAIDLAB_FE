import { apiClient, type ApiResponse, handleApiError } from '../index';

// 소비자 관련 타입 정의
export interface ConsumerProfileRequestDto {
  profileImage?: string;
  address?: string;
  detailAddress?: string;
}

export interface ConsumerProfileResponseDto {
  profileImage?: string;
  phoneNumber: string;
  name: string;
  birth: string;
  gender: 'MALE' | 'FEMALE';
  address?: string;
  detailAddress?: string;
}

export interface ConsumerMyPageDto {
  name: string;
  point: number;
  profileImage?: string;
}

export interface PreferenceRequestDto {
  preference: boolean;
}

export interface LikedManagerResponseDto {
  managerUuid: string;
  name: string;
  profileImage?: string;
  averageRate: number;
  introduceText?: string;
  region: string[];
}

export interface BlackListedManagerResponseDto {
  managerUuid: string;
  name: string;
  profileImage?: string;
  averageRate: number;
  introduceText?: string;
  region: string[];
}

// 소비자 API 함수들
export const consumerApi = {
  // 프로필 조회
  getProfile: async (): Promise<ConsumerProfileResponseDto> => {
    try {
      const response = await apiClient.get<
        ApiResponse<ConsumerProfileResponseDto>
      >('/api/consumers/profile');
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 프로필 수정
  updateProfile: async (data: ConsumerProfileRequestDto): Promise<void> => {
    try {
      await apiClient.patch<ApiResponse<void>>('/api/consumers/profile', data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 마이페이지 조회
  getMypage: async (): Promise<ConsumerMyPageDto> => {
    try {
      const response = await apiClient.get<ApiResponse<ConsumerMyPageDto>>(
        '/api/consumers/mypage',
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 찜/블랙리스트 등록
  createPreference: async (
    managerUuid: string,
    data: PreferenceRequestDto,
  ): Promise<void> => {
    try {
      await apiClient.post<ApiResponse<void>>(
        `/api/consumers/preference/${managerUuid}`,
        data,
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 찜한 매니저 조회
  getLikedManagers: async (): Promise<LikedManagerResponseDto[]> => {
    try {
      const response = await apiClient.get<
        ApiResponse<LikedManagerResponseDto[]>
      >('/api/consumers/likes');
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 찜한 매니저 삭제
  removeLikedManager: async (managerUuid: string): Promise<void> => {
    try {
      await apiClient.delete<ApiResponse<void>>(
        `/api/consumers/likes/${managerUuid}`,
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 블랙리스트 매니저 조회
  getBlackListManagers: async (): Promise<BlackListedManagerResponseDto[]> => {
    try {
      const response = await apiClient.get<
        ApiResponse<BlackListedManagerResponseDto[]>
      >('/api/consumers/blacklists');
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
