import { useState, useCallback } from 'react';
import { reservationApi } from '@/apis/reservation';
import { useApiCall } from '../useApiCall';
import type { PaginationParams, PaginationResponse } from '@/types/api';
import type { ReservationStatus } from '@/constants/status';

interface UseReservationPaginationResult {
  data: PaginationResponse<any> | null; // Changed from ReservationListResponse to any
  params: PaginationParams;
  loading: boolean;
  error: string | null;
  fetchReservations: (newParams?: Partial<PaginationParams>) => Promise<void>;
  changeStatus: (status?: ReservationStatus) => Promise<void>;
  changePage: (page: number) => Promise<void>;
  changeSort: (
    sortBy: PaginationParams['sortBy'],
    sortOrder: PaginationParams['sortOrder'],
  ) => Promise<void>;
  reset: () => void;
}

/**
 * 서버사이드 예약 페이징 훅
 */
export const useReservationPagination = (): UseReservationPaginationResult => {
  const [data, setData] = useState<PaginationResponse<any> | null>(null); // Changed from ReservationListResponse to any
  const [params, setParams] = useState<PaginationParams>({
    page: 0,
    size: 5,
    sortBy: 'reservationDate',
    sortOrder: 'DESC',
  });
  const [error, setError] = useState<string | null>(null);

  const { callApi, loading } = useApiCall();

  /**
   * 예약 목록 조회
   */
  const fetchReservations = useCallback(
    async (newParams?: Partial<PaginationParams>) => {
      const queryParams = newParams ? { ...params, ...newParams } : params;

      console.log('🔍 Fetching reservations with params:', queryParams);

      const result = await callApi(
        () => reservationApi.getReservationsPaginated(queryParams),
        {
          showSuccessToast: false,
          errorMessage: '예약 목록을 불러오는데 실패했습니다.',
        },
      );

      if (result.success) {
        console.log('✅ Fetched reservations:', result.data);
        setData(result.data || null);
        setParams(queryParams);
        setError(null);
      } else {
        console.error('❌ Failed to fetch reservations:', result.error);
        setError(result.error || '예약 목록을 불러오는데 실패했습니다.');
        setData(null);
      }
    },
    [callApi, params],
  );

  /**
   * 상태 필터 변경
   */
  const changeStatus = useCallback(
    async (status?: ReservationStatus) => {
      console.log('🔄 Changing status filter to:', status);
      await fetchReservations({ status, page: 0 });
    },
    [fetchReservations],
  );

  /**
   * 페이지 변경
   */
  const changePage = useCallback(
    async (page: number) => {
      console.log('📄 Changing to page:', page);
      await fetchReservations({ page });
    },
    [fetchReservations],
  );

  /**
   * 정렬 변경
   */
  const changeSort = useCallback(
    async (
      sortBy: PaginationParams['sortBy'],
      sortOrder: PaginationParams['sortOrder'],
    ) => {
      console.log('🔃 Changing sort:', { sortBy, sortOrder });
      await fetchReservations({ sortBy, sortOrder, page: 0 });
    },
    [fetchReservations],
  );

  /**
   * 상태 초기화
   */
  const reset = useCallback(() => {
    console.log('🔄 Resetting pagination state');
    setData(null);
    setParams({
      page: 0,
      size: 5,
      sortBy: 'reservationDate',
      sortOrder: 'DESC',
    });
    setError(null);
  }, []);

  return {
    data,
    params,
    loading,
    error,
    fetchReservations,
    changeStatus,
    changePage,
    changeSort,
    reset,
  };
};
