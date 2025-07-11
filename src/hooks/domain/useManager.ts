import { useState, useCallback } from 'react';
import { managerApi } from '@/apis/manager';
import { useApiCall } from '../useApiCall';
import type {
  ManagerProfileCreateRequest,
  ManagerProfileUpdateRequest,
  ManagerProfileResponse,
} from '@/types/domain/manager';

/**
 * 매니저 관련 기능만 담당하는 훅
 */
export const useManager = () => {
  const [profile, setProfile] = useState<ManagerProfileResponse | null>(null);
  const { executeApi, loading } = useApiCall();

  // 프로필 생성
  const createProfile = useCallback(
    async (data: ManagerProfileCreateRequest) => {
      return executeApi(() => managerApi.createProfile(data), {
        successMessage: '프로필이 생성되었습니다.',
        errorMessage: '프로필 생성에 실패했습니다.',
      });
    },
    [executeApi],
  );

  // 프로필 조회
  const fetchProfile = useCallback(async () => {
    const result = await executeApi(() => managerApi.getProfile(), {
      successMessage: null,
      errorMessage: '프로필을 불러오는데 실패했습니다.',
    });

    if (result.success) {
      setProfile(result.data ?? null);
      return result.data;
    }
    return null;
  }, [executeApi]);

  // 프로필 수정
  const updateProfile = useCallback(
    async (data: ManagerProfileUpdateRequest) => {
      const result = await executeApi(() => managerApi.updateProfile(data), {
        successMessage: '프로필이 수정되었습니다.',
        errorMessage: '프로필 수정에 실패했습니다.',
      });

      if (result.success) {
        await fetchProfile();
      }

      return result;
    },
    [executeApi, fetchProfile],
  );

  // 마이페이지 조회
  const fetchMypage = useCallback(async () => {
    const result = await executeApi(() => managerApi.getMypage(), {
      successMessage: null,
      errorMessage: '마이페이지 정보를 불러오는데 실패했습니다.',
    });

    return result.success ? result.data : null;
  }, [executeApi]);

  // 내 리뷰 목록 조회
  const fetchMyReviews = useCallback(async () => {
    const result = await executeApi(() => managerApi.getMyReviews(), {
      successMessage: null,
      errorMessage: '리뷰를 불러오는데 실패했습니다.',
    });

    return result.success ? result.data : null;
  }, [executeApi]);

  return {
    profile,
    loading,
    fetchProfile,
    updateProfile,
    fetchMypage,
    createProfile,
    fetchMyReviews,
  };
};
