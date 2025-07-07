import { useState, useEffect, useCallback } from 'react';
import { reservationApi } from '@/apis/reservation';
import { useApiCall } from '../useApiCall';
import type {
  ReservationListResponse,
  PageResponse,
  PagingParams,
} from '@/types/reservation';

interface UseManagerReservationPaginationParams {
  initialStatus?: 'TODAY' | 'PAID' | 'WORKING' | 'COMPLETED';
  initialPage?: number;
  pageSize?: number;
  initialSortBy?: string;
  initialSortOrder?: 'ASC' | 'DESC';
}

export const useManagerReservationPagination = ({
  initialStatus = 'TODAY',
  initialPage = 0,
  pageSize = 5,
  initialSortBy = 'reservationDate',
  initialSortOrder = 'DESC',
}: UseManagerReservationPaginationParams = {}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [status, setStatus] = useState<
    'TODAY' | 'PAID' | 'WORKING' | 'COMPLETED'
  >(initialStatus);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>(initialSortOrder);
  const [data, setData] =
    useState<PageResponse<ReservationListResponse> | null>(null);

  const { callApi, loading } = useApiCall();

  // API 호출 함수
  const fetchReservations = useCallback(
    async (params?: Partial<PagingParams>) => {
      const queryParams: PagingParams = {
        page: currentPage,
        size: pageSize,
        sortBy: sortBy as any,
        sortOrder: sortOrder,
        status: status as any, // TODO: 백엔드에서 매니저 전용 상태 타입 정의 필요
        ...params,
      };

      const result = await callApi(
        () => reservationApi.getManagerReservationsPaginated(queryParams),
        {
          showSuccessToast: false,
          errorMessage: '예약 목록을 불러오는데 실패했습니다.',
        },
      );

      if (result.success && result.data) {
        setData(result.data);
        return result.data;
      } else {
        setData(null);
        return null;
      }
    },
    [callApi, currentPage, pageSize, status, sortBy, sortOrder],
  );

  // 페이지 변경
  const changePage = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  // 상태 변경
  const changeStatus = useCallback(
    (newStatus: 'TODAY' | 'PAID' | 'WORKING' | 'COMPLETED') => {
      setStatus(newStatus);
      setCurrentPage(0); // 상태 변경 시 첫 페이지로 이동
    },
    [],
  );

  // 정렬 변경
  const changeSort = useCallback(
    (newSortBy?: string, newSortOrder?: 'ASC' | 'DESC') => {
      if (newSortBy) setSortBy(newSortBy);
      if (newSortOrder) setSortOrder(newSortOrder);
      setCurrentPage(0);
    },
    [],
  );

  // 새로고침
  const refresh = useCallback(() => {
    fetchReservations();
  }, [fetchReservations]);

  // 첫 페이지로 이동
  const goToFirstPage = useCallback(() => {
    setCurrentPage(0);
  }, []);

  // 페이지 변경 시 API 호출
  useEffect(() => {
    fetchReservations();
  }, [currentPage, status, sortBy, sortOrder]); // fetchReservations 의존성 제거하여 무한 루프 방지

  return {
    // 데이터
    data,
    reservations: data?.content || [],
    loading,

    // 페이지네이션 정보
    currentPage,
    totalPages: data?.totalPages || 0,
    totalElements: data?.totalElements || 0,
    isFirst: data?.first || true,
    isLast: data?.last || true,

    // 현재 상태
    status,

    // 정렬 정보
    sortBy,
    sortOrder,

    // 액션
    changePage,
    changeStatus,
    changeSort,
    refresh,
    goToFirstPage,
    fetchReservations,
  };
};
