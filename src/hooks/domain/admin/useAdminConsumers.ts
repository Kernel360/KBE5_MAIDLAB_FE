import { useCallback } from 'react';
import { adminApi } from '@/apis/admin';
import { useApiCall } from '../../useApiCall';
import type { AdminPageParams } from '@/types/domain/admin';

export const useAdminConsumers = () => {
  const { executeApi, loading } = useApiCall();

  // 소비자 목록 조회
  const fetchConsumers = useCallback(
    async (params?: AdminPageParams) => {
      const result = await executeApi(() => adminApi.getConsumers(params), {
        successMessage: null,
        errorMessage: '소비자 목록 조회에 실패했습니다.',
      });

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  // 소비자 상세 조회
  const fetchConsumer = useCallback(
    async (consumerId: number) => {
      const result = await executeApi(() => adminApi.getConsumer(consumerId), {
        successMessage: null,
        errorMessage: '소비자 정보 조회에 실패했습니다.',
      });

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  // 대시보드용 소비자 통계
  const getConsumerCount = useCallback(async () => {
    const result = await executeApi(() => adminApi.getConsumerCount(), {
      successMessage: null,
      errorMessage: '소비자 수 조회에 실패했습니다.',
    });

    return result.success ? result.data : null;
  }, [executeApi]);

  const getTotalReservationCount = useCallback(
    async (consumerId: number) => {
      const result = await executeApi(
        () => adminApi.getTotalReservationCount(consumerId),
        {
          successMessage: null,
          errorMessage: '소비자 예약 수 조회에 실패했습니다.',
        },
      );

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  const getReviewPercent = useCallback(
    async (consumerId: number) => {
      const result = await executeApi(
        () => adminApi.getReviewPercent(consumerId),
        {
          successMessage: null,
          errorMessage: '소비자 리뷰 비율 조회에 실패했습니다.',
        },
      );

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  const getTotalPaidMoney = useCallback(
    async (consumerId: number) => {
      const result = await executeApi(
        () => adminApi.getTotalPaidMoney(consumerId),
        {
          successMessage: null,
          errorMessage: '소비자 결제 금액 조회에 실패했습니다.',
        },
      );

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  return {
    loading,
    fetchConsumers,
    fetchConsumer,
    getConsumerCount,
    getTotalReservationCount,
    getReviewPercent,
    getTotalPaidMoney,
  };
};
