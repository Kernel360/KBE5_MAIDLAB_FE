import { useRef, useCallback } from 'react';

/**
 * 예약 데이터 캐시 관리 전용 훅
 */
export const useReservationCache = () => {
  const lastUpdateRef = useRef<number>(0);
  const UPDATE_INTERVAL = 10000; // 10초

  const shouldUpdate = useCallback((force: boolean = false): boolean => {
    const now = Date.now();
    return force || now - lastUpdateRef.current > UPDATE_INTERVAL;
  }, []);

  const updateTime = useCallback((): void => {
    lastUpdateRef.current = Date.now();
  }, []);

  const getCacheAge = useCallback((): number => {
    return Date.now() - lastUpdateRef.current;
  }, []);

  return {
    shouldUpdate,
    updateTime,
    getCacheAge,
    isExpired: () => getCacheAge() > UPDATE_INTERVAL,
  };
};
