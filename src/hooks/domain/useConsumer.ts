import { useState, useCallback } from 'react';
import { consumerApi } from '@/apis/consumer';
import { useApiCall } from '../useApiCall';
import type {
  ConsumerProfileUpdateRequest,
  ConsumerProfileResponse,
  LikedManagerResponse,
  BlackListedManagerResponse,
  ConsumerProfileCreateRequest,
} from '@/types/domain/consumer';

export const useConsumer = () => {
  const [profile, setProfile] = useState<ConsumerProfileResponse | null>(null);
  const [likedManagers, setLikedManagers] = useState<LikedManagerResponse[]>(
    [],
  );
  const [blacklistedManagers, setBlacklistedManagers] = useState<
    BlackListedManagerResponse[]
  >([]);
  const { executeApi, loading } = useApiCall();

  // 프로필 조회
  const fetchProfile = useCallback(async () => {
    const result = await executeApi(() => consumerApi.getProfile(), {
      successMessage: null,
      errorMessage: '프로필을 불러오는데 실패했습니다.',
    });

    if (result.success && result.data) {
      setProfile(result.data);
      return result.data;
    }
    return null;
  }, [executeApi]);

  // 프로필 수정
  const updateProfile = useCallback(
    async (data: ConsumerProfileUpdateRequest) => {
      const result = await executeApi(() => consumerApi.updateProfile(data), {
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

  // 프로필 생성
  const createProfile = useCallback(
    async (data: ConsumerProfileCreateRequest) => {
      const result = await executeApi(() => consumerApi.createProfile(data), {
        successMessage: '프로필이 등록되었습니다.',
        errorMessage: '프로필 등록에 실패했습니다.',
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
    const result = await executeApi(() => consumerApi.getMypage(), {
      successMessage: null,
      errorMessage: '마이페이지 정보를 불러오는데 실패했습니다.',
    });

    return result.success ? result.data : null;
  }, [executeApi]);

  // 찜한 매니저 목록 조회
  const fetchLikedManagers = useCallback(async () => {
    const result = await executeApi(() => consumerApi.getLikedManagers(), {
      successMessage: null,
      errorMessage: '찜한 매니저 목록을 불러오는데 실패했습니다.',
    });

    if (result.success && result.data) {
      setLikedManagers(result.data);
      return result.data;
    }
    return [];
  }, [executeApi]);

  // 블랙리스트 매니저 목록 조회
  const fetchBlacklistedManagers = useCallback(async () => {
    const result = await executeApi(() => consumerApi.getBlackListManagers(), {
      successMessage: null,
      errorMessage: '블랙리스트를 불러오는데 실패했습니다.',
    });

    if (result.success && result.data) {
      setBlacklistedManagers(result.data);
      return result.data;
    }
    return [];
  }, [executeApi]);

  // 매니저 찜하기/블랙리스트 추가
  const setManagerPreference = useCallback(
    async (
      managerUuid: string,
      preference: boolean, // true: 찜하기, false: 블랙리스트
    ) => {
      const successMessage = preference
        ? '찜 목록에 추가되었습니다.'
        : '블랙리스트에 추가되었습니다.';
      const errorMessage = preference
        ? '찜하기에 실패했습니다.'
        : '블랙리스트 추가에 실패했습니다.';

      const result = await executeApi(
        () => consumerApi.createPreference(managerUuid, { preference }),
        {
          successMessage,
          errorMessage,
        },
      );

      if (result.success) {
        // 목록 새로고침
        if (preference) {
          await fetchLikedManagers();
        } else {
          await fetchBlacklistedManagers();
        }
      }

      return result;
    },
    [executeApi, fetchLikedManagers, fetchBlacklistedManagers],
  );

  // 찜한 매니저 삭제
  const removeLikedManager = useCallback(
    async (managerUuid: string) => {
      const result = await executeApi(
        () => consumerApi.removePreferenceManager(managerUuid),
        {
          successMessage: '찜 목록에서 제거되었습니다.',
          errorMessage: '찜 해제에 실패했습니다.',
        },
      );

      if (result.success) {
        // 로컬 상태에서 제거
        setLikedManagers((prev) =>
          prev.filter((manager) => manager.managerUuid !== managerUuid),
        );
      }

      return result;
    },
    [executeApi],
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

  return {
    profile,
    likedManagers,
    blacklistedManagers,
    loading,
    fetchProfile,
    updateProfile,
    createProfile,
    fetchMypage,
    fetchLikedManagers,
    fetchBlacklistedManagers,
    setManagerPreference,
    removeLikedManager,
    likeManager,
    blacklistManager,
  };
};
