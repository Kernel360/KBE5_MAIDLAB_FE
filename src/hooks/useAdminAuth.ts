import { useState, useCallback, useMemo } from 'react';
import { adminApi } from '@/apis/admin';
import { tokenStorage, userStorage } from '@/utils/storage';
import { useToast } from './useToast';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, USER_TYPES } from '@/constants';
import type { AdminLoginRequest } from '@/types/admin';

export const useAdminAuth = () => {
  const [loading, setLoading] = useState(false);
  const [authTrigger, setAuthTrigger] = useState(0); // 리렌더링 트리거
  const { showToast } = useToast();

  // useMemo를 사용해서 authTrigger가 변경될 때마다 재계산
  const isAuthenticated = useMemo(() => {
    // authTrigger를 의존성에 포함시켜서 변경 시 재계산되도록 함
    const token = tokenStorage.getAccessToken();
    const userType = userStorage.getUserType();
    return !!token && userType === USER_TYPES.ADMIN;
  }, [authTrigger]); // authTrigger를 의존성으로 추가

  // 관리자 로그인
  const login = useCallback(
    async (credentials: AdminLoginRequest) => {
      try {
        setLoading(true);

        const response = await adminApi.login(credentials);

        tokenStorage.setAccessToken(response.accessToken);
        userStorage.setUserType(USER_TYPES.ADMIN);
        setAuthTrigger((prev) => prev + 1); // 강제 리렌더링

        showToast(SUCCESS_MESSAGES.LOGIN, 'success');
        return { success: true };
      } catch (error: any) {
        const errorMessage =
          error.message || ERROR_MESSAGES.INVALID_CREDENTIALS;
        showToast(errorMessage, 'error');
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  // 관리자 로그아웃
  const logout = useCallback(async () => {
    try {
      await adminApi.logout();
    } catch (error) {
      console.error('Admin logout API failed:', error);
    } finally {
      tokenStorage.clearTokens();
      userStorage.clearUserData();
      setAuthTrigger((prev) => prev + 1); // 강제 리렌더링
      showToast(SUCCESS_MESSAGES.LOGOUT, 'success');
    }
  }, [showToast]);

  // 토큰 갱신
  const adminRefreshToken = useCallback(async () => {
    try {
      const response = await adminApi.refreshToken();
      tokenStorage.setAccessToken(response.accessToken);
      setAuthTrigger((prev) => prev + 1); // 강제 리렌더링
      return true;
    } catch {
      logout();
      return false;
    }
  }, [logout]);

  return {
    loading,
    isAuthenticated,
    login,
    logout,
    adminRefreshToken,
  };
};
