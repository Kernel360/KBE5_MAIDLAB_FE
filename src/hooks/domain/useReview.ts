import { useCallback } from 'react';
import { reservationApi } from '@/apis/reservation';
import { useApiCall } from '../useApiCall';
import type { ReviewRegisterRequest } from '@/types/domain/review';

export const useReview = () => {
  const { executeApi, loading } = useApiCall();

  // 리뷰 등록
  const registerReview = useCallback(
    async (data: ReviewRegisterRequest) => {
      const result = await executeApi(
        () => reservationApi.registerReview(data),
        {
          successMessage: '리뷰가 등록되었습니다.',
          errorMessage: '리뷰 등록에 실패했습니다.',
        },
      );

      return result;
    },
    [executeApi],
  );

  return {
    loading,
    registerReview,
  };
};
