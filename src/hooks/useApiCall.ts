import { useState, useCallback, useRef } from 'react';
import { useToast } from './useToast';

interface ApiCallOptions {
  successMessage?: string | null;
  errorMessage?: string | null;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  cacheTime?: number;
  cacheKey?: string;
}

// 간단한 인메모리 캐시
const apiCache = new Map<string, { data: any; timestamp: number }>();

/**
 * 공통 API 호출 패턴을 추상화한 훅
 */
export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const callApi = useCallback(
    async <T>(apiCall: () => Promise<T>, options: ApiCallOptions = {}) => {
      const {
        successMessage,
        errorMessage = '요청에 실패했습니다.',
        showSuccessToast = true,
        showErrorToast = true,
        cacheTime = 5 * 60 * 1000, // 5분 기본 캐시
        cacheKey,
      } = options;

      // 캐시 확인
      if (cacheKey) {
        const cached = apiCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < cacheTime) {
          return { success: true, data: cached.data };
        }
      }

      // 이전 요청 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      try {
        setLoading(true);
        abortControllerRef.current = new AbortController();
        
        const data = await apiCall();

        // 캐시 저장
        if (cacheKey) {
          apiCache.set(cacheKey, { data, timestamp: Date.now() });
        }

        if (successMessage && showSuccessToast) {
          showToast(successMessage, 'success');
        }

        return { success: true, data };
      } catch (error: any) {
        if (error.name === 'AbortError') {
          return { success: false, error: 'Request cancelled' };
        }
        
        if (showErrorToast && errorMessage) {
          showToast(errorMessage, 'error');
        }
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [showToast],
  );

  // Alias for consistency with other patterns
  const executeApi = callApi;

  // 캐시 무효화 함수
  const invalidateCache = useCallback((key?: string) => {
    if (key) {
      apiCache.delete(key);
    } else {
      apiCache.clear();
    }
  }, []);

  return { callApi, executeApi, loading, invalidateCache };
};
