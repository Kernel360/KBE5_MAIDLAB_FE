import { useState, useCallback } from 'react';
import { useToast } from './useToast';

interface ApiCallOptions {
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

/**
 * 공통 API 호출 패턴을 추상화한 훅
 * 모든 도메인 훅에서 반복되는 try-catch-finally 패턴을 제거
 */
export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const callApi = useCallback(
    async <T>(apiCall: () => Promise<T>, options: ApiCallOptions = {}) => {
      const {
        successMessage,
        errorMessage = '요청에 실패했습니다.',
        showSuccessToast = true,
        showErrorToast = true,
      } = options;

      try {
        setLoading(true);
        const data = await apiCall();

        if (successMessage && showSuccessToast) {
          showToast(successMessage, 'success');
        }

        return { success: true, data };
      } catch (error: any) {
        if (showErrorToast) {
          showToast(error.message || errorMessage, 'error');
        }
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  return { callApi, loading };
};
