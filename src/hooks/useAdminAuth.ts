import { useState, useCallback } from 'react';
import { adminApi } from '@/apis/admin';
import { tokenStorage, userStorage } from '@/utils/storage';
import { useToast } from './useToast';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, USER_TYPES } from '@/constants';
import type { AdminLoginRequestDto } from '@/apis/admin';

export const useAdminAuth = () => {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { showToast } = useToast();

  // 관리자 로그인
  const login = useCallback(
    async (credentials: AdminLoginRequestDto) => {
      try {
        setLoading(true);

        const response = await adminApi.login(credentials);

        tokenStorage.setAccessToken(response.accessToken);
        userStorage.setUserType(USER_TYPES.ADMIN);

        setIsAuthenticated(true);
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
      setIsAuthenticated(false);
      showToast(SUCCESS_MESSAGES.LOGOUT, 'success');
    }
  }, [showToast]);

  // 토큰 갱신
  const refreshToken = useCallback(async () => {
    try {
      const response = await adminApi.refreshToken();
      tokenStorage.setAccessToken(response.accessToken);
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
    refreshToken,
  };
};
