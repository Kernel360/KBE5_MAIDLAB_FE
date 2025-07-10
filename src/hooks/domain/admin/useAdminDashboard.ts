import { useCallback } from 'react';
import { adminApi } from '@/apis/admin';
import { useApiCall } from '../../useApiCall';

export const useAdminDashboard = () => {
  const { executeApi, loading } = useApiCall();

  // 이벤트 수 조회
  const getEventCount = useCallback(async () => {
    const result = await executeApi(() => adminApi.getEventCount(), {
      successMessage: null,
      errorMessage: '이벤트 수 조회에 실패했습니다.',
    });

    return result.success ? result.data : null;
  }, [executeApi]);

  // 관리자 로그 조회
  const getAdminLogs = useCallback(
    async (lines: number = 50) => {
      const result = await executeApi(() => adminApi.getAdminLogs(lines), {
        successMessage: null,
        errorMessage: '관리자 로그 조회에 실패했습니다.',
      });

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  // 전체 대시보드 데이터 조회 (한 번에 모든 통계 정보를 가져오는 편의 함수)
  const fetchDashboardData = useCallback(async () => {
    const [
      managerCount,
      newManagerCount,
      consumerCount,
      todayReservationCount,
      eventCount,
      refundBoardCount,
      counselBoardCount,
    ] = await Promise.allSettled([
      executeApi(() => adminApi.getManagerCount(), {
        successMessage: null,
        errorMessage: null,
      }),
      executeApi(() => adminApi.getNewManagerCount(), {
        successMessage: null,
        errorMessage: null,
      }),
      executeApi(() => adminApi.getConsumerCount(), {
        successMessage: null,
        errorMessage: null,
      }),
      executeApi(() => adminApi.getTodayReservationCount(), {
        successMessage: null,
        errorMessage: null,
      }),
      executeApi(() => adminApi.getEventCount(), {
        successMessage: null,
        errorMessage: null,
      }),
      executeApi(() => adminApi.getRefundBoardCount(), {
        successMessage: null,
        errorMessage: null,
      }),
      executeApi(() => adminApi.getCounselBoardCount(), {
        successMessage: null,
        errorMessage: null,
      }),
    ]);

    return {
      managerCount:
        managerCount.status === 'fulfilled' && managerCount.value.success
          ? managerCount.value.data
          : 0,
      newManagerCount:
        newManagerCount.status === 'fulfilled' && newManagerCount.value.success
          ? newManagerCount.value.data
          : 0,
      consumerCount:
        consumerCount.status === 'fulfilled' && consumerCount.value.success
          ? consumerCount.value.data
          : 0,
      todayReservationCount:
        todayReservationCount.status === 'fulfilled' &&
        todayReservationCount.value.success
          ? todayReservationCount.value.data
          : 0,
      eventCount:
        eventCount.status === 'fulfilled' && eventCount.value.success
          ? eventCount.value.data
          : 0,
      refundBoardCount:
        refundBoardCount.status === 'fulfilled' &&
        refundBoardCount.value.success
          ? refundBoardCount.value.data
          : 0,
      counselBoardCount:
        counselBoardCount.status === 'fulfilled' &&
        counselBoardCount.value.success
          ? counselBoardCount.value.data
          : 0,
    };
  }, [executeApi]);

  return {
    loading,
    getEventCount,
    getAdminLogs,
    fetchDashboardData,
  };
};
