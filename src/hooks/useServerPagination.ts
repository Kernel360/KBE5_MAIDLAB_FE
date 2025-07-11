import { useState, useCallback, useEffect } from 'react';
import { useApiCall } from './useApiCall';
import type { PaginationParams, PaginationResponse } from '@/types/api';

interface UseServerPaginationOptions<T, P extends PaginationParams> {
  fetcher: (params: P) => Promise<PaginationResponse<T>>;
  initialParams: P;
  autoFetch?: boolean;
}

interface UseServerPaginationResult<T, P extends PaginationParams> {
  data: PaginationResponse<T> | null;
  params: P;
  loading: boolean;
  error: string | null;
  fetchData: (newParams?: Partial<P>) => Promise<void>;
  updateParams: (newParams: Partial<P>) => void;
  changePage: (page: number) => Promise<void>;
  changeSort: (
    sortBy?: P['sortBy'],
    sortOrder?: P['sortOrder'],
  ) => Promise<void>;
  reset: () => void;
}

/**
 * 제네릭 서버사이드 페이지네이션 훅
 */
export const useServerPagination = <T, P extends PaginationParams>({
  fetcher,
  initialParams,
  autoFetch = true,
}: UseServerPaginationOptions<T, P>): UseServerPaginationResult<T, P> => {
  const [data, setData] = useState<PaginationResponse<T> | null>(null);
  const [params, setParams] = useState<P>(initialParams);
  const [error, setError] = useState<string | null>(null);

  const { executeApi, loading } = useApiCall();

  /**
   * 데이터 조회
   */
  const fetchData = useCallback(
    async (newParams?: Partial<P>) => {
      const queryParams = newParams ? { ...params, ...newParams } : params;

      const result = await executeApi(() => fetcher(queryParams), {
        successMessage: null,
        errorMessage: '데이터를 불러오는데 실패했습니다.',
      });

      if (result.success) {
        setData(result.data || null);
        setParams(queryParams);
        setError(null);
      } else {
        setError(result.error || '데이터를 불러오는데 실패했습니다.');
        setData(null);
      }
    },
    [executeApi, params, fetcher],
  );

  /**
   * 파라미터 업데이트 (API 호출 없음)
   */
  const updateParams = useCallback((newParams: Partial<P>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  /**
   * 페이지 변경
   */
  const changePage = useCallback(
    async (page: number) => {
      await fetchData({ page } as Partial<P>);
    },
    [fetchData],
  );

  /**
   * 정렬 변경
   */
  const changeSort = useCallback(
    async (sortBy?: P['sortBy'], sortOrder?: P['sortOrder']) => {
      const sortParams: Partial<P> = { page: 0 } as Partial<P>;
      if (sortBy !== undefined) sortParams.sortBy = sortBy;
      if (sortOrder !== undefined) sortParams.sortOrder = sortOrder;

      await fetchData(sortParams);
    },
    [fetchData],
  );

  /**
   * 상태 초기화
   */
  const reset = useCallback(() => {
    setData(null);
    setParams(initialParams);
    setError(null);
  }, [initialParams]);

  // 초기 데이터 로드
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    params,
    loading,
    error,
    fetchData,
    updateParams,
    changePage,
    changeSort,
    reset,
  };
};
