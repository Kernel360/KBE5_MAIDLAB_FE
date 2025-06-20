import { apiCall, buildQueryString } from '../index';
import type {
  MatchingRequestListResponse,
  AvailableManagerResponse,
  MatchingRequest,
} from '@/types/matching';
import { API_ENDPOINTS } from '@/constants/api';

export const matchingApi = {
  /**
   * 매칭 매니저 조회
   */
  getMatchingManagers: async (
    data: MatchingRequest,
  ): Promise<AvailableManagerResponse[]> => {
    return apiCall<AvailableManagerResponse[]>(
      'post',
      API_ENDPOINTS.MATCHING.MANAGERS,
      data,
    );
  },

  /**
   * 매칭 시작
   */
  startMatch: async (
    reservationId: number,
    managerId: number,
  ): Promise<string> => {
    const queryString = buildQueryString({
      reservation_id: reservationId,
      manager_id: managerId,
    });
    return apiCall<string>(
      'post',
      `${API_ENDPOINTS.MATCHING.START}${queryString}`,
    );
  },

  /**
   * 매칭 조회
   */
  getMatching: async (
    page: number,
    size: number,
  ): Promise<MatchingRequestListResponse[]> => {
    const queryString = buildQueryString({ page, size });
    return apiCall<MatchingRequestListResponse[]>(
      'get',
      `${API_ENDPOINTS.MATCHING.LIST}${queryString}`,
    );
  },
};
