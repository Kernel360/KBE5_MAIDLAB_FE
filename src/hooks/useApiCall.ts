import { useState, useCallback } from 'react';
import { useToast } from './useToast';

interface ApiCallOptions {
  successMessage?: string | null;
  errorMessage?: string | null;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

/**
 * 공통 API 호출 패턴을 추상화한 훅
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
        if (showErrorToast && errorMessage) {
          showToast(errorMessage, 'error');
        }
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  // Alias for consistency with other patterns
  const executeApi = callApi;

  return { callApi, executeApi, loading };
};
