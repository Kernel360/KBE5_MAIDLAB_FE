import { useState, useCallback } from 'react';
import { reservationApi } from '@/apis/reservation';
import { useServerPagination } from '../../useServerPagination';
import type {
  ReservationPagingParams,
  ReservationListResponse,
} from '@/types/domain/reservation';
import type { ReservationStatus } from '@/constants/status';
import type {
  ManagerStatusFilter,
  UseManagerReservationPaginationOptions,
} from '@/types/hooks/managerReservation';

// 매니저 필터 상태를 API 상태로 변환하는 함수
const mapManagerStatusToApiStatus = (
  managerStatus: ManagerStatusFilter,
): ReservationStatus | undefined => {
  switch (managerStatus) {
    case 'TODAY':
      return undefined; // TODAY는 날짜 기반 필터링, API에서는 status 파라미터 없음
    case 'PAID':
      return 'PAID';
    case 'WORKING':
      return 'WORKING';
    case 'COMPLETED':
      return 'COMPLETED';
    default:
      return undefined;
  }
};

export const useManagerReservationPagination = ({
  initialStatus = 'TODAY',
  initialPage = 0,
  pageSize = 5,
  initialSortBy = 'reservationDate',
  initialSortOrder = 'DESC',
}: UseManagerReservationPaginationOptions = {}) => {
  const [status, setStatus] = useState<ManagerStatusFilter>(initialStatus);

  const initialParams: ReservationPagingParams = {
    page: initialPage,
    size: pageSize,
    sortBy: initialSortBy,
    sortOrder: initialSortOrder,
    status: mapManagerStatusToApiStatus(initialStatus),
  } as ReservationPagingParams;

  const {
    data,
    params,
    loading,
    fetchData: fetchReservations,
    changePage: baseChangePage,
    changeSort: baseChangeSort,
  } = useServerPagination<ReservationListResponse, ReservationPagingParams>({
    fetcher: reservationApi.getManagerReservationsPaginated,
    initialParams,
  });

  // 페이지 변경
  const changePage = useCallback(
    async (newPage: number) => {
      await baseChangePage(newPage);
    },
    [baseChangePage],
  );

  // 상태 변경
  const changeStatus = useCallback(
    async (newStatus: ManagerStatusFilter) => {
      setStatus(newStatus);
      await fetchReservations({
        status: mapManagerStatusToApiStatus(newStatus),
        page: 0,
      } as Partial<ReservationPagingParams>);
    },
    [fetchReservations],
  );

  // 정렬 변경
  const changeSort = useCallback(
    async (
      newSortBy?: ReservationPagingParams['sortBy'],
      newSortOrder?: 'ASC' | 'DESC',
    ) => {
      await baseChangeSort(newSortBy, newSortOrder);
    },
    [baseChangeSort],
  );

  // 새로고침
  const refresh = useCallback(() => {
    fetchReservations();
  }, [fetchReservations]);

  // 첫 페이지로 이동
  const goToFirstPage = useCallback(async () => {
    await changePage(0);
  }, [changePage]);

  return {
    // 데이터
    data,
    reservations: data?.content || [],
    loading,

    // 페이지네이션 정보
    currentPage: params.page || 0,
    totalPages: data?.totalPages || 0,
    totalElements: data?.totalElements || 0,
    isFirst: data?.first || true,
    isLast: data?.last || true,

    // 현재 상태
    status,

    // 정렬 정보
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,

    // 액션
    changePage,
    changeStatus,
    changeSort,
    refresh,
    goToFirstPage,
    fetchReservations,
  };
};
