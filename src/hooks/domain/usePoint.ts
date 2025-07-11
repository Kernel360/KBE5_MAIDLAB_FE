import { useState, useCallback } from 'react';
import { consumerApi } from '@/apis/consumer';
import { useApiCall } from '../useApiCall';
import type { PointRecordResponseDto } from '@/types/domain/consumer';

export const usePoint = () => {
  const [point, setPoint] = useState<number | null>(null);
  const [history, setHistory] = useState<PointRecordResponseDto[]>([]);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const { executeApi, loading } = useApiCall();

  // 포인트 단일 조회
  const fetchPoint = useCallback(async () => {
    const result = await executeApi(() => consumerApi.getPoint(), {
      successMessage: null,
      errorMessage: '포인트 조회에 실패했습니다.',
    });

    if (result.success && result.data) {
      setPoint(result.data.totalPoint ?? 0);
    }

    return result;
  }, [executeApi]);

  // 포인트 내역 조회
  const fetchPointHistory = useCallback(
    async (body: any) => {
      const result = await executeApi(() => consumerApi.getPointRecord(body), {
        successMessage: null,
        errorMessage: '포인트 내역 조회에 실패했습니다.',
      });

      if (result.success && result.data) {
        setHistory(result.data.content ?? []);
        setHasNext(result.data.hasNext ?? false);
      }

      return result;
    },
    [executeApi],
  );

  return {
    point,
    history,
    hasNext,
    loading,
    fetchPoint,
    fetchPointHistory,
  };
};
