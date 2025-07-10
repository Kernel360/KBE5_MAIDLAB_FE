import { useCallback } from 'react';
import { reservationApi } from '@/apis/reservation';
import { useServerPagination } from '../../useServerPagination';
import type {
  ReservationListResponse,
  ReservationPagingParams,
} from '@/types/domain/reservation';
import type { PaginationResponse } from '@/types/api';
import type { ReservationStatus } from '@/constants/status';

interface UseReservationPaginationResult {
  data: PaginationResponse<ReservationListResponse> | null;
  params: ReservationPagingParams;
  loading: boolean;
  error: string | null;
  fetchReservations: (
    newParams?: Partial<ReservationPagingParams>,
  ) => Promise<void>;
  changeStatus: (status?: ReservationStatus) => Promise<void>;
  changePage: (page: number) => Promise<void>;
  changeSort: (
    sortBy: ReservationPagingParams['sortBy'],
    sortOrder: ReservationPagingParams['sortOrder'],
  ) => Promise<void>;
  reset: () => void;
}

/**
 * 서버사이드 예약 페이징 훅
 */
export const useReservationPagination = (): UseReservationPaginationResult => {
  const initialParams: ReservationPagingParams = {
    page: 0,
    size: 5,
    sortBy: 'reservationDate',
    sortOrder: 'DESC',
  };

  const {
    data,
    params,
    loading,
    error,
    fetchData: fetchReservations,
    changePage,
    changeSort,
    reset,
  } = useServerPagination<ReservationListResponse, ReservationPagingParams>({
    fetcher: reservationApi.getReservationsPaginated,
    initialParams,
  });

  /**
   * 상태 필터 변경
   */
  const changeStatus = useCallback(
    async (status?: ReservationStatus) => {
      await fetchReservations({ status, page: 0 });
    },
    [fetchReservations],
  );

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
