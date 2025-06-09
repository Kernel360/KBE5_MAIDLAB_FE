import { useState, useCallback } from 'react';
import { managerApi } from '@/apis/manager';
import { consumerApi } from '@/apis/consumer';
import { useToast } from './useToast';
import type {
  ProfileRequestDto,
  ProfileUpdateRequestDto,
  ProfileResponseDto,
} from '@/apis/manager';

export const useManager = () => {
  const [profile, setProfile] = useState<ProfileResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // 프로필 생성
  const createProfile = useCallback(
    async (data: ProfileRequestDto) => {
      try {
        setLoading(true);
        await managerApi.createProfile(data);

        showToast('프로필이 생성되었습니다.', 'success');
        return { success: true };
      } catch (error: any) {
        showToast(error.message || '프로필 생성에 실패했습니다.', 'error');
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  // 프로필 조회
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await managerApi.getProfile();
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
    async (data: ProfileUpdateRequestDto) => {
      try {
        setLoading(true);
        await managerApi.updateProfile(data);

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
      const data = await managerApi.getMypage();
      return data;
    } catch (error: any) {
      showToast(
        error.message || '마이페이지 정보를 불러오는데 실패했습니다.',
        'error',
      );
      return null;
    }
  }, [showToast]);

  // 내 리뷰 목록 조회
  const fetchMyReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await managerApi.getMyReviews();
      return data;
    } catch (error: any) {
      showToast(error.message || '리뷰를 불러오는데 실패했습니다.', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // 매니저 찜하기 (소비자용)
  const likeManager = useCallback(
    async (managerUuid: string) => {
      try {
        await consumerApi.createPreference(managerUuid, { preference: true });
        showToast('찜 목록에 추가되었습니다.', 'success');
        return { success: true };
      } catch (error: any) {
        showToast(error.message || '찜하기에 실패했습니다.', 'error');
        return { success: false, error: error.message };
      }
    },
    [showToast],
  );

  // 매니저 블랙리스트 추가 (소비자용)
  const blacklistManager = useCallback(
    async (managerUuid: string) => {
      try {
        await consumerApi.createPreference(managerUuid, { preference: false });
        showToast('블랙리스트에 추가되었습니다.', 'success');
        return { success: true };
      } catch (error: any) {
        showToast(error.message || '블랙리스트 추가에 실패했습니다.', 'error');
        return { success: false, error: error.message };
      }
    },
    [showToast],
  );

  return {
    profile,
    loading,
    createProfile,
    fetchProfile,
    updateProfile,
    fetchMypage,
    fetchMyReviews,
    likeManager,
    blacklistManager,
  };
};
