import { useCallback } from 'react';
import { getUserType as getStoredUserType } from '@/utils/auth'; // 🔧 utils 활용
import { useManager } from './useManager';
import { useConsumer } from './useConsumer';
import type { UserType } from '@/constants';

/**
 * 통합 사용자 인터페이스 훅
 */
export const useUser = () => {
  // 개별 훅들 가져오기
  const managerHook = useManager();
  const consumerHook = useConsumer();

  // 🔧 utils/auth.ts의 getUserType 활용
  const userType = getStoredUserType() as UserType;

  // 사용자 타입에 따른 동적 인터페이스 제공
  const currentUserHook = userType === 'MANAGER' ? managerHook : consumerHook;

  // 통합 프로필 조회
  const fetchProfile = useCallback(async () => {
    return await currentUserHook.fetchProfile();
  }, [currentUserHook]);

  // 통합 프로필 수정
  const updateProfile = useCallback(
    async (profileData: any) => {
      return await currentUserHook.updateProfile(profileData);
    },
    [currentUserHook],
  );

  // 통합 마이페이지 조회
  const fetchMyPageInfo = useCallback(async () => {
    return await currentUserHook.fetchMypage();
  }, [currentUserHook]);

  // 🔧 사용자 타입별 특화 기능 조건부 제공
  const userSpecificFeatures = {
    // 매니저 전용 기능
    ...(userType === 'MANAGER' && {
      createProfile: managerHook.createProfile,
      fetchMyReviews: managerHook.fetchMyReviews,
    }),
    // 소비자 전용 기능
    ...(userType === 'CONSUMER' && {
      fetchLikedManagers: consumerHook.fetchLikedManagers,
      fetchBlacklistedManagers: consumerHook.fetchBlacklistedManagers,
      likeManager: consumerHook.likeManager,
      blacklistManager: consumerHook.blacklistManager,
      setManagerPreference: consumerHook.setManagerPreference,
      removeLikedManager: consumerHook.removeLikedManager,
    }),
  };

  return {
    profile: currentUserHook.profile,
    loading: currentUserHook.loading,
    userType,
    fetchProfile,
    updateProfile,
    fetchMyPageInfo,
    ...userSpecificFeatures,
  };
};
