// useMatching.ts - 수정버전 (useManager 코드 제거)
import { useState, useCallback } from 'react';
import { matchingApi } from '@/apis/matching';
import { useToast } from '../useToast';
import type {
  MatchingRequest,
  AvailableManagerResponse,
  MatchingRequestListResponse,
} from '@/types/matching';

export const useMatching = () => {
  const [availableManagers, setAvailableManagers] = useState<
    AvailableManagerResponse[]
  >([]);
  const [matchings, setMatchings] = useState<MatchingRequestListResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // 사용 가능한 매니저 조회
  const fetchAvailableManagers = useCallback(
    async (data: MatchingRequest) => {
      try {
        setLoading(true);
        const managers = await matchingApi.getMatchingManagers(data);
        setAvailableManagers(managers);
        return managers;
      } catch (error: any) {
        showToast(
          error.message || '매니저 목록을 불러오는데 실패했습니다.',
          'error',
        );
        return [];
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  // 매칭 시작
  const startMatching = useCallback(
    async (reservationId: number, managerId: number) => {
      try {
        setLoading(true);
        const result = await matchingApi.startMatch(reservationId, managerId);

        showToast('매칭이 시작되었습니다.', 'success');
        return { success: true, data: result };
      } catch (error: any) {
        showToast(error.message || '매칭 시작에 실패했습니다.', 'error');
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  // 매칭 목록 조회
  const fetchMatchings = useCallback(
    async (page: number = 0, size: number = 10) => {
      try {
        setLoading(true);
        const data = await matchingApi.getMatching(page, size);
        setMatchings(data);
        return data;
      } catch (error: any) {
        showToast(
          error.message || '매칭 목록을 불러오는데 실패했습니다.',
          'error',
        );
        return [];
      } finally {
        setLoading(false);
      }
    },
    [showToast],
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
