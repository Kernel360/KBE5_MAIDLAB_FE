import { useState, useCallback } from 'react';
import { managerApi } from '@/apis/manager';
import { useApiCall } from '../useApiCall';
import {
  formatPrice,
  formatRating,
  maskName,
  maskPhoneNumber,
} from '@/utils/format'; // 🔧 utils 활용
import type {
  ManagerProfileCreateRequest,
  ManagerProfileUpdateRequest,
  ManagerProfileResponse,
} from '@/types/domain/manager';
import { useConsumer } from './useConsumer';

/**
 * 매니저 관련 기능만 담당하는 훅
 * 🔧 소비자 관련 기능(찜하기, 블랙리스트)는 useConsumer로 완전 분리
 */
export const useManager = () => {
  const [profile, setProfile] = useState<ManagerProfileResponse | null>(null);
  const { callApi, loading } = useApiCall();

  // 프로필 생성
  const createProfile = useCallback(
    async (data: ManagerProfileCreateRequest) => {
      return callApi(() => managerApi.createProfile(data), {
        successMessage: '프로필이 생성되었습니다.',
        errorMessage: '프로필 생성에 실패했습니다.',
      });
    },
    [callApi],
  );

  // 프로필 조회
  const fetchProfile = useCallback(async () => {
    const result = await callApi(() => managerApi.getProfile(), {
      showSuccessToast: false,
      errorMessage: '프로필을 불러오는데 실패했습니다.',
    });

    if (result.success) {
      setProfile(result.data ?? null);
      return result.data;
    }
    return null;
  }, [callApi]);

  // 프로필 수정
  const updateProfile = useCallback(
    async (data: ManagerProfileUpdateRequest) => {
      const result = await callApi(() => managerApi.updateProfile(data), {
        successMessage: '프로필이 수정되었습니다.',
        errorMessage: '프로필 수정에 실패했습니다.',
      });

      if (result.success) {
        await fetchProfile();
      }

      return result;
    },
    [callApi, fetchProfile],
  );

  // 마이페이지 조회
  const fetchMypage = useCallback(async () => {
    const result = await callApi(() => managerApi.getMypage(), {
      showSuccessToast: false,
      errorMessage: '마이페이지 정보를 불러오는데 실패했습니다.',
    });

    return result.success ? result.data : null;
  }, [callApi]);

  // 내 리뷰 목록 조회
  const fetchMyReviews = useCallback(async () => {
    const result = await callApi(() => managerApi.getMyReviews(), {
      showSuccessToast: false,
      errorMessage: '리뷰를 불러오는데 실패했습니다.',
    });

    return result.success ? result.data : null;
  }, [callApi]);

  // 🔧 utils/format.ts 활용한 포맷팅 함수들
  const formatProfileData = useCallback((profile: ManagerProfileResponse) => {
    return {
      ...profile,
      maskedName: maskName(profile.name),
      formattedName: profile.name,
    };
  }, []);

  // 소비자 관련 기능 위임
  const {
    likedManagers,
    blacklistedManagers,
    fetchLikedManagers,
    fetchBlacklistedManagers,
    setManagerPreference,
    removeLikedManager,
  } = useConsumer();

  return {
    profile,
    likedManagers,
    blacklistedManagers,
    loading,
    fetchProfile,
    updateProfile,
    fetchMypage,
    fetchLikedManagers,
    fetchBlacklistedManagers,
    setManagerPreference,
    removeLikedManager,
    formatProfileData,
    createProfile,
    fetchMyReviews,
  };
};
