import { apiClient, type ApiResponse, handleApiError } from '../index';

// 매니저 관련 타입 정의
export interface ProfileRequestDto {
  profileImage?: string;
  serviceTypes: ServiceListItem[];
  regions: RegionListItem[];
  availableTimes: ScheduleListItem[];
  introduceText?: string;
  documents: DocumentListItem[];
}

export interface ProfileUpdateRequestDto {
  profileImage?: string;
  name: string;
  birth?: string;
  gender?: 'MALE' | 'FEMALE';
  serviceTypes?: ServiceListItem[];
  regions: RegionListItem[];
  availableTimes: ScheduleListItem[];
  introduceText?: string;
}

export interface ServiceListItem {
  serviceType: string;
}

export interface RegionListItem {
  region: string;
}

export interface ScheduleListItem {
  day: string;
  startTime: string;
  endTime: string;
}

export interface DocumentListItem {
  fileType: string;
  fileName: string;
  uploadedFileUrl: string;
}

export interface ProfileResponseDto {
  userid: number;
  userType: 'CONSUMER' | 'MANAGER';
  isVerified: boolean;
  profileImage?: string;
  name: string;
  birth: string;
  gender: 'MALE' | 'FEMALE';
  regions: RegionListItem[];
  schedules: ScheduleListItem[];
  services: string[];
  introduceText?: string;
}

export interface MypageResponseDto {
  userid: number;
  userType: 'CONSUMER' | 'MANAGER';
  profileImage?: string;
  name: string;
  isVerified: boolean;
}

export interface ReviewListResponseDto {
  reviews: ReviewListItem[];
}

export interface ReviewListItem {
  reviewId: string;
  rating: number;
  name: string;
  comment: string;
  serviceType: string;
  serviceDetailType: string;
}

// 매니저 API 함수들
export const managerApi = {
  // 프로필 생성
  createProfile: async (data: ProfileRequestDto): Promise<void> => {
    try {
      await apiClient.post<ApiResponse<void>>('/api/manager/profile', data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 프로필 조회
  getProfile: async (): Promise<ProfileResponseDto> => {
    try {
      const response = await apiClient.get<ApiResponse<ProfileResponseDto>>(
        '/api/manager/profile',
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 프로필 수정
  updateProfile: async (data: ProfileUpdateRequestDto): Promise<void> => {
    try {
      await apiClient.put<ApiResponse<void>>('/api/manager/profile', data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 마이페이지 조회
  getMypage: async (): Promise<MypageResponseDto> => {
    try {
      const response = await apiClient.get<ApiResponse<MypageResponseDto>>(
        '/api/manager/mypage',
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 내 리뷰 목록 조회
  getMyReviews: async (): Promise<ReviewListResponseDto> => {
    try {
      const response = await apiClient.get<ApiResponse<ReviewListResponseDto>>(
        '/api/manager/myReviews',
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
