import { useCallback } from 'react';
import { adminApi } from '@/apis/admin';
import { useApiCall } from '../../useApiCall';
import type {
  AdminPageParams,
  ManagerStatusParams,
} from '@/types/domain/admin';

export const useAdminManagers = () => {
  const { executeApi, loading } = useApiCall();

  // 매니저 목록 조회
  const fetchManagers = useCallback(
    async (params?: AdminPageParams) => {
      const result = await executeApi(() => adminApi.getManagers(params), {
        successMessage: null,
        errorMessage: '매니저 목록 조회에 실패했습니다.',
      });

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  // 매니저 상세 조회
  const fetchManager = useCallback(
    async (managerId: number) => {
      const result = await executeApi(() => adminApi.getManager(managerId), {
        successMessage: null,
        errorMessage: '매니저 정보 조회에 실패했습니다.',
      });

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  // 매니저 상태별 조회
  const fetchManagersByStatus = useCallback(
    async (params: ManagerStatusParams) => {
      const result = await executeApi(
        () => adminApi.getManagersByStatus(params),
        {
          successMessage: null,
          errorMessage: '매니저 상태별 조회에 실패했습니다.',
        },
      );

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  // 매니저 승인
  const approveManager = useCallback(
    async (managerId: number) => {
      const result = await executeApi(
        () => adminApi.approveManager(managerId),
        {
          successMessage: '매니저가 승인되었습니다.',
          errorMessage: '매니저 승인에 실패했습니다.',
        },
      );

      return result;
    },
    [executeApi],
  );

  // 매니저 거절
  const rejectManager = useCallback(
    async (managerId: number) => {
      const result = await executeApi(() => adminApi.rejectManager(managerId), {
        successMessage: '매니저가 거절되었습니다.',
        errorMessage: '매니저 거절에 실패했습니다.',
      });

      return result;
    },
    [executeApi],
  );

  // 대시보드용 매니저 통계
  const getManagerCount = useCallback(async () => {
    const result = await executeApi(() => adminApi.getManagerCount(), {
      successMessage: null,
      errorMessage: '매니저 수 조회에 실패했습니다.',
    });

    return result.success ? result.data : null;
  }, [executeApi]);

  const getNewManagerCount = useCallback(async () => {
    const result = await executeApi(() => adminApi.getNewManagerCount(), {
      successMessage: null,
      errorMessage: '신규 매니저 수 조회에 실패했습니다.',
    });

    return result.success ? result.data : null;
  }, [executeApi]);

  const getMatchedCount = useCallback(
    async (managerId: number) => {
      const result = await executeApi(
        () => adminApi.getMatchedCount(managerId),
        {
          successMessage: null,
          errorMessage: '매니저 매칭 수 조회에 실패했습니다.',
        },
      );

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  const getManagerSettlementSum = useCallback(
    async (managerId: number) => {
      const result = await executeApi(
        () => adminApi.getManagerSettlementSum(managerId),
        {
          successMessage: null,
          errorMessage: '매니저 정산 합계 조회에 실패했습니다.',
        },
      );

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  const getManagerReviewPercent = useCallback(
    async (managerId: number) => {
      const result = await executeApi(
        () => adminApi.getManagerReviewPercent(managerId),
        {
          successMessage: null,
          errorMessage: '매니저 리뷰 비율 조회에 실패했습니다.',
        },
      );

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  return {
    loading,
    fetchManagers,
    fetchManager,
    fetchManagersByStatus,
    approveManager,
    rejectManager,
    getManagerCount,
    getNewManagerCount,
    getMatchedCount,
    getManagerSettlementSum,
    getManagerReviewPercent,
  };
};
