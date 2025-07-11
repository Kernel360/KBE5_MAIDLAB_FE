import { useCallback } from 'react';
import { adminApi } from '@/apis/admin';
import { useApiCall } from '../../useApiCall';
import type { AdminPageParams } from '@/types/domain/admin';

export const useAdminReservations = () => {
  const { executeApi, loading } = useApiCall();

  // 전체 예약 조회
  const fetchReservations = useCallback(
    async (params?: AdminPageParams) => {
      const result = await executeApi(() => adminApi.getReservations(params), {
        successMessage: null,
        errorMessage: '예약 목록 조회에 실패했습니다.',
      });

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  // 예약 상세 조회
  const fetchReservation = useCallback(
    async (reservationId: number) => {
      const result = await executeApi(
        () => adminApi.getReservation(reservationId),
        {
          successMessage: null,
          errorMessage: '예약 정보 조회에 실패했습니다.',
        },
      );

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  // 수요자별 예약 조회
  const fetchConsumerReservations = useCallback(
    async (consumerId: number, params?: AdminPageParams) => {
      const result = await executeApi(
        () => adminApi.getConsumerReservations(consumerId, params),
        {
          successMessage: null,
          errorMessage: '수요자 예약 목록 조회에 실패했습니다.',
        },
      );

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  // 매니저별 예약 조회
  const fetchManagerReservations = useCallback(
    async (managerId: number, params?: AdminPageParams) => {
      const result = await executeApi(
        () => adminApi.getManagerReservations(managerId, params),
        {
          successMessage: null,
          errorMessage: '매니저 예약 목록 조회에 실패했습니다.',
        },
      );

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  // 일별 예약 조회
  const fetchDailyReservations = useCallback(
    async (date: string, params?: AdminPageParams) => {
      const result = await executeApi(
        () => adminApi.getDailyReservations(date, params),
        {
          successMessage: null,
          errorMessage: '일별 예약 조회에 실패했습니다.',
        },
      );

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  // 주간 정산 조회
  const fetchWeeklySettlements = useCallback(
    async (startDate: string, params?: AdminPageParams) => {
      const result = await executeApi(
        () => adminApi.getWeeklySettlements(startDate, params),
        {
          successMessage: null,
          errorMessage: '주간 정산 조회에 실패했습니다.',
        },
      );

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  // 정산 상세 조회
  const fetchSettlementDetail = useCallback(
    async (settlementId: number) => {
      const result = await executeApi(
        () => adminApi.getSettlementDetail(settlementId),
        {
          successMessage: null,
          errorMessage: '정산 상세 조회에 실패했습니다.',
        },
      );

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  // 정산 승인
  const approveSettlement = useCallback(
    async (settlementId: number) => {
      const result = await executeApi(
        () => adminApi.approveSettlement(settlementId),
        {
          successMessage: '정산이 승인되었습니다.',
          errorMessage: '정산 승인에 실패했습니다.',
        },
      );

      return result;
    },
    [executeApi],
  );

  // 정산 거부
  const rejectSettlement = useCallback(
    async (settlementId: number) => {
      const result = await executeApi(
        () => adminApi.rejectSettlement(settlementId),
        {
          successMessage: '정산이 거부되었습니다.',
          errorMessage: '정산 거부에 실패했습니다.',
        },
      );

      return result;
    },
    [executeApi],
  );

  // 대시보드용 예약 통계
  const getTodayReservationCount = useCallback(async () => {
    const result = await executeApi(() => adminApi.getTodayReservationCount(), {
      successMessage: null,
      errorMessage: '오늘 예약 수 조회에 실패했습니다.',
    });

    return result.success ? result.data : null;
  }, [executeApi]);

  return {
    loading,
    fetchReservations,
    fetchReservation,
    fetchConsumerReservations,
    fetchManagerReservations,
    fetchDailyReservations,
    fetchWeeklySettlements,
    fetchSettlementDetail,
    approveSettlement,
    rejectSettlement,
    getTodayReservationCount,
  };
};
