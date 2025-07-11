import { useState, useCallback } from 'react';
import { matchingApi } from '@/apis/matching';
import { useApiCall } from '../useApiCall';
import type {
  MatchingRequest,
  AvailableManagerResponse,
  MatchingRequestListResponse,
} from '@/types/domain/matching';

export const useMatching = () => {
  const [availableManagers, setAvailableManagers] = useState<
    AvailableManagerResponse[]
  >([]);
  const [matchings, setMatchings] = useState<MatchingRequestListResponse[]>([]);
  const { executeApi, loading } = useApiCall();

  // 사용 가능한 매니저 조회
  const fetchAvailableManagers = useCallback(
    async (data: MatchingRequest) => {
      const result = await executeApi(
        () => matchingApi.getMatchingManagers(data),
        {
          successMessage: null,
          errorMessage:
            '해당 날짜와 예약 시간에 가능한 매니저가 없습니다. 예약 날짜와 시간을 변경해주세요.',
        },
      );

      if (result.success && result.data) {
        setAvailableManagers(result.data);
        return result.data;
      }
      return [];
    },
    [executeApi],
  );

  // 매칭 시작
  const startMatching = useCallback(
    async (reservationId: number, managerId: number) => {
      const result = await executeApi(
        () => matchingApi.startMatch(reservationId, managerId),
        {
          successMessage: '매칭이 시작되었습니다.',
          errorMessage: '매칭 시작에 실패했습니다.',
        },
      );

      return result;
    },
    [executeApi],
  );

  // 매칭 목록 조회
  const fetchMatchings = useCallback(
    async (page: number = 0, size: number = 10) => {
      const result = await executeApi(
        () => matchingApi.getMatching(page, size),
        {
          successMessage: null,
          errorMessage: '매칭 목록을 불러오는데 실패했습니다.',
        },
      );

      if (result.success && result.data) {
        setMatchings(result.data);
        return result.data;
      }
      return [];
    },
    [executeApi],
  );

  return {
    availableManagers,
    matchings,
    loading,
    fetchAvailableManagers,
    startMatching,
    fetchMatchings,
  };
};
