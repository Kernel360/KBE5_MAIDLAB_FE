import { useState, useCallback } from 'react';
import { consumerApi } from '@/apis/consumer';
import { useToast } from '../useToast';
import type {
  ConsumerProfileUpdateRequest,
  ConsumerProfileResponse,
  LikedManagerResponse,
  BlackListedManagerResponse,
} from '@/types/consumer';

export const useConsumer = () => {
  const [profile, setProfile] = useState<ConsumerProfileResponse | null>(null);
  const [likedManagers, setLikedManagers] = useState<LikedManagerResponse[]>(
    [],
  );
  const [blacklistedManagers, setBlacklistedManagers] = useState<
    BlackListedManagerResponse[]
  >([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // 프로필 조회
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await consumerApi.getProfile();
      setProfile(data);
      return data;
    } catch (error: any) {
      showToast(error.message || '프로필을 불러오는데 실패했습니다.', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // 프로필 수정
  const updateProfile = useCallback(
    async (data: ConsumerProfileUpdateRequest) => {
      try {
        setLoading(true);
        await consumerApi.updateProfile(data);

        // 프로필 새로고침
        await fetchProfile();
        showToast('프로필이 수정되었습니다.', 'success');

        return { success: true };
      } catch (error: any) {
        showToast(error.message || '프로필 수정에 실패했습니다.', 'error');
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchProfile, showToast],
  );

  // 마이페이지 조회
  const fetchMypage = useCallback(async () => {
    try {
      const data = await consumerApi.getMypage();
      return data;
    } catch (error: any) {
      showToast(
        error.message || '마이페이지 정보를 불러오는데 실패했습니다.',
        'error',
      );
      return null;
    }
  }, [showToast]);

  // 찜한 매니저 목록 조회
  const fetchLikedManagers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await consumerApi.getLikedManagers();
      setLikedManagers(data);
      return data;
    } catch (error: any) {
      showToast(
        error.message || '찜한 매니저 목록을 불러오는데 실패했습니다.',
        'error',
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // 블랙리스트 매니저 목록 조회
  const fetchBlacklistedManagers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await consumerApi.getBlackListManagers();
      setBlacklistedManagers(data);
      return data;
    } catch (error: any) {
      showToast(
        error.message || '블랙리스트를 불러오는데 실패했습니다.',
        'error',
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // 매니저 찜하기/블랙리스트 추가
  const setManagerPreference = useCallback(
    async (
      managerUuid: string,
      preference: boolean, // true: 찜하기, false: 블랙리스트
    ) => {
      try {
        await consumerApi.createPreference(managerUuid, { preference });

        const message = preference
          ? '찜 목록에 추가되었습니다.'
          : '블랙리스트에 추가되었습니다.';
        showToast(message, 'success');

        // 목록 새로고침
        if (preference) {
          await fetchLikedManagers();
        } else {
          await fetchBlacklistedManagers();
        }

        return { success: true };
      } catch (error: any) {
        const errorMessage = preference
          ? '찜하기에 실패했습니다.'
          : '블랙리스트 추가에 실패했습니다.';
        showToast(error.message || errorMessage, 'error');
        return { success: false, error: error.message };
      }
    },
    [showToast, fetchLikedManagers, fetchBlacklistedManagers],
  );

  // 찜한 매니저 삭제
  const removeLikedManager = useCallback(
    async (managerUuid: string) => {
      try {
        await consumerApi.removeLikedManager(managerUuid);

        // 로컬 상태에서 제거
        setLikedManagers((prev) =>
          prev.filter((manager) => manager.managerUuid !== managerUuid),
        );

        showToast('찜 목록에서 제거되었습니다.', 'success');
        return { success: true };
      } catch (error: any) {
        showToast(error.message || '찜 해제에 실패했습니다.', 'error');
        return { success: false, error: error.message };
      }
    },
    [showToast],
  );

  // 매니저 찜하기
  const likeManager = useCallback(
    async (managerUuid: string) => {
      return setManagerPreference(managerUuid, true);
    },
    [setManagerPreference],
  );

  // 매니저 블랙리스트 추가
  const blacklistManager = useCallback(
    async (managerUuid: string) => {
      return setManagerPreference(managerUuid, false);
    },
    [setManagerPreference],
  );

  // 소비자 프로필 포맷팅 함수 (이름 마스킹 예시)
  const formatProfileData = useCallback((profile: ConsumerProfileResponse) => {
    return {
      ...profile,
      maskedName: profile.name
        ? profile.name[0] + '*'.repeat(profile.name.length - 1)
        : '',
      formattedName: profile.name,
    };
  }, []);

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
    likeManager,
    blacklistManager,
    formatProfileData,
  };
};
