import { apiCall } from '../index';
import type {
  ConsumerProfileResponse,
  ConsumerProfileUpdateRequest,
  ConsumerMyPageResponse,
  LikedManagerResponse,
  BlackListedManagerResponse,
  PreferenceRequest,
  ConsumerProfileCreateRequest,
  PointRecordResponseDto,
} from '@/types/domain/consumer';
import { API_ENDPOINTS } from '@/constants/api';

export const consumerApi = {
/**
 * 포인트 조회
 */
getPoint: async (): Promise<{ totalPoint: number }> => {
  return apiCall<{ totalPoint: number }>('get', API_ENDPOINTS.CONSUMER.POINT);
},

/**
 * 포인트 내역 조회 (post)
 */
getPointRecord: async (data: any): Promise<{ content: PointRecordResponseDto[]; hasNext: boolean }> => {
  return apiCall<{ content: PointRecordResponseDto[]; hasNext: boolean }>('post', API_ENDPOINTS.CONSUMER.POINT_RECORD, data);
},
  /**
   * 프로필 조회
   */
  getProfile: async (): Promise<ConsumerProfileResponse> => {
    return apiCall<ConsumerProfileResponse>(
      'get',
      API_ENDPOINTS.CONSUMER.PROFILE,
    );
  },

  /**
   * 프로필 생성
   */
  createProfile: async (data: ConsumerProfileCreateRequest): Promise<void> => {
    return apiCall<void>('post', API_ENDPOINTS.CONSUMER.PROFILE, data);
  }, 

  /**
   * 프로필 수정
   */
  updateProfile: async (data: ConsumerProfileUpdateRequest): Promise<void> => {
    return apiCall<void>('patch', API_ENDPOINTS.CONSUMER.PROFILE, data);
  },

  /**
   * 마이페이지 조회
   */
  getMypage: async (): Promise<ConsumerMyPageResponse> => {
    return apiCall<ConsumerMyPageResponse>(
      'get',
      API_ENDPOINTS.CONSUMER.MYPAGE,
    );
  },

  /**
   * 선호도 생성
   */
  createPreference: async (
    managerUuid: string,
    data: PreferenceRequest,
  ): Promise<void> => {
    return apiCall<void>(
      'post',
      API_ENDPOINTS.CONSUMER.PREFERENCE(managerUuid),
      data,
    );
  },

  /**
   * 찜한 매니저 조회
   */
  getLikedManagers: async (): Promise<LikedManagerResponse[]> => {
    return apiCall<LikedManagerResponse[]>('get', API_ENDPOINTS.CONSUMER.LIKES);
  },

  /**
   * 찜한 매니저 삭제
   */
  removePreferenceManager: async (managerUuid: string): Promise<void> => {
    return apiCall<void>(
      'delete',
      API_ENDPOINTS.CONSUMER.REMOVE_PREFERENCE(managerUuid),
    );
  },

  /**
   * 블랙리스트 매니저 조회
   */
  getBlackListManagers: async (): Promise<BlackListedManagerResponse[]> => {
    return apiCall<BlackListedManagerResponse[]>(
      'get',
      API_ENDPOINTS.CONSUMER.BLACKLIST,
    );
  },

  
};
