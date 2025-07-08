import { apiCall } from '../index';
import type {
  ManagerProfileResponse,
  ManagerProfileCreateRequest,
  ManagerProfileUpdateRequest,
  ManagerMyPageResponse,
  ManagerReviewListResponse,
} from '@/types/domain/manager';
import { API_ENDPOINTS } from '@/constants/api';

export const managerApi = {
  /**
   * 프로필 생성
   */
  createProfile: async (data: ManagerProfileCreateRequest): Promise<void> => {
    return apiCall<void>('post', API_ENDPOINTS.MANAGER.PROFILE, data);
  },

  /**
   * 프로필 조회
   */
  getProfile: async (): Promise<ManagerProfileResponse> => {
    return apiCall<ManagerProfileResponse>(
      'get',
      API_ENDPOINTS.MANAGER.PROFILE,
    );
  },

  /**
   * 프로필 수정
   */
  updateProfile: async (data: ManagerProfileUpdateRequest): Promise<void> => {
    return apiCall<void>('put', API_ENDPOINTS.MANAGER.PROFILE, data);
  },

  /**
   * 마이페이지 조회
   */
  getMypage: async (): Promise<ManagerMyPageResponse> => {
    return apiCall<ManagerMyPageResponse>('get', API_ENDPOINTS.MANAGER.MYPAGE);
  },

  /**
   * 내 리뷰 목록 조회
   */
  getMyReviews: async (): Promise<ManagerReviewListResponse> => {
    return apiCall<ManagerReviewListResponse>(
      'get',
      API_ENDPOINTS.MANAGER.REVIEWS,
    );
  },
};
