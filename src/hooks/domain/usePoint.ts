import { useState, useCallback } from 'react';
import { consumerApi } from '@/apis/consumer';
import type { PointRecordResponseDto } from '@/types/domain/consumer';

export const usePoint = () => {
  const [point, setPoint] = useState<number | null>(null);
  const [history, setHistory] = useState<PointRecordResponseDto[]>([]);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 포인트 단일 조회
  const fetchPoint = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await consumerApi.getPoint();
      setPoint(res?.totalPoint ?? 0);
    } catch (e: any) {
      setError(e?.message || '포인트 조회 실패');
    } finally {
      setLoading(false);
    }
  }, []);

  // 포인트 내역 조회
  const fetchPointHistory = useCallback(async (body: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await consumerApi.getPointRecord(body);
      setHistory(res.content ?? []);
      setHasNext(res.hasNext ?? false);
    } catch (e: any) {
      setError(e?.message || '포인트 내역 조회 실패');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    point,
    history,
    hasNext,
    loading,
    error,
    fetchPoint,
    fetchPointHistory,
  };
}; 