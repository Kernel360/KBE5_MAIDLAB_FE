import { useCallback } from 'react';
import { adminApi } from '@/apis/admin';
import { useApiCall } from '../../useApiCall';
import type {
  AdminPageParams,
  ManagerChangeRequest,
} from '@/types/domain/admin';

export const useAdminMatching = () => {
  const { executeApi, loading } = useApiCall();

  // 전체 매칭 조회
  const fetchAllMatching = useCallback(
    async (params?: AdminPageParams) => {
      const result = await executeApi(() => adminApi.getAllMatching(params), {
        successMessage: null,
        errorMessage: '매칭 목록 조회에 실패했습니다.',
      });

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  // 상태별 매칭 조회
  const fetchMatchingByStatus = useCallback(
    async (status: string, params?: AdminPageParams) => {
      const result = await executeApi(
        () => adminApi.getMatchingByStatus(status, params),
        {
          successMessage: null,
          errorMessage: '상태별 매칭 조회에 실패했습니다.',
        },
      );

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  // 매니저 변경
  const changeManager = useCallback(
    async (data: ManagerChangeRequest) => {
      const result = await executeApi(() => adminApi.changeManager(data), {
        successMessage: '매니저가 변경되었습니다.',
        errorMessage: '매니저 변경에 실패했습니다.',
      });

      return result;
    },
    [executeApi],
  );

  return {
    loading,
    fetchAllMatching,
    fetchMatchingByStatus,
    changeManager,
  };
};
