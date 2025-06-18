import { useState, useCallback } from 'react';
import { managerApi } from '@/apis/manager';
import { consumerApi } from '@/apis/consumer';
import { userStorage } from '@/utils';
import { useToast } from '../useToast';
import type {
  ConsumerProfileUpdateRequest,
  ConsumerProfileResponse,
} from '@/types/consumer';
import type {
  ManagerProfileUpdateRequest,
  ManagerProfileResponse,
} from '@/types/manager';

export const useUser = () => {
  const [profile, setProfile] = useState<
    ConsumerProfileResponse | ManagerProfileResponse | null
  >(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // 프로필 조회
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const userType = userStorage.getUserType();

      let data;
      if (userType === 'MANAGER') {
        data = await managerApi.getProfile();
      } else if (userType === 'CONSUMER') {
        data = await consumerApi.getProfile();
      } else {
        throw new Error('Invalid user type');
      }

      setProfile(data);
      userStorage.setUserInfo(data);
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
    async (
      profileData: ConsumerProfileUpdateRequest | ManagerProfileUpdateRequest,
    ) => {
      try {
        setLoading(true);
        const userType = userStorage.getUserType();

        if (userType === 'MANAGER') {
          await managerApi.updateProfile(
            profileData as ManagerProfileUpdateRequest,
          );
        } else if (userType === 'CONSUMER') {
          await consumerApi.updateProfile(
            profileData as ConsumerProfileUpdateRequest,
          );
        }

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

  // 마이페이지 정보 조회
  const fetchMyPageInfo = useCallback(async () => {
    try {
      const userType = userStorage.getUserType();

      let data;
      if (userType === 'MANAGER') {
        data = await managerApi.getMypage();
      } else if (userType === 'CONSUMER') {
        data = await consumerApi.getMypage();
      } else {
        throw new Error('Invalid user type');
      }

      return data;
    } catch (error: any) {
      showToast(
        error.message || '마이페이지 정보를 불러오는데 실패했습니다.',
        'error',
      );
      return null;
    }
  }, [showToast]);

  return {
    profile,
    loading,
    fetchProfile,
    updateProfile,
    fetchMyPageInfo,
  };
};
