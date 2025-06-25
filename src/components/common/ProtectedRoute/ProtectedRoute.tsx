import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/constants';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';
import { authApi } from '@/apis/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredUserType?: 'CONSUMER' | 'MANAGER' | 'ADMIN';
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredUserType,
  redirectTo = ROUTES.LOGIN,
}) => {
  const { isAuthenticated, userType, isLoading } = useAuth();
  const navigate = useNavigate();
  const [tokenCheckComplete, setTokenCheckComplete] = useState(false);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);

  // 🔧 쿠키에서 리프레시 토큰 확인 함수
  const hasRefreshTokenInCookie = () => {
    return document.cookie
      .split(';')
      .some((cookie) => cookie.trim().startsWith('refreshToken='));
  };

  // 🔧 완전 로그아웃 처리 함수
  const forceLogout = () => {
    // 모든 localStorage 삭제
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userInfo');

    // 추가로 다른 저장소도 정리 (필요한 경우)
    sessionStorage.clear();

    // 홈으로 리다이렉트
    navigate(ROUTES.HOME);
  };

  // 🔧 토큰 갱신 함수
  const refreshTokenIfNeeded = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        console.warn('액세스 토큰이 없습니다.');
        setTokenCheckComplete(true);
        return false;
      }

      // 🔧 리프레시 토큰이 쿠키에 없는 경우 강제 로그아웃
      if (!hasRefreshTokenInCookie()) {
        console.warn('리프레시 토큰이 쿠키에 없습니다.');
        forceLogout();
        return false;
      }

      // JWT 토큰 만료 확인
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        // 토큰이 아직 유효하면 갱신 불필요
        if (payload.exp && payload.exp > currentTime + 300) {
          // 5분 여유
          setTokenCheckComplete(true);
          return true;
        }
      } catch (e) {
        console.warn('토큰 파싱 실패. 갱신을 시도합니다.');
      }

      // 토큰 갱신 시도 (리프레시 토큰은 쿠키에서 자동 전송됨)
      setIsRefreshingToken(true);

      try {
        const response = await authApi.refreshToken();

        if (response.accessToken) {
          localStorage.setItem('accessToken', response.accessToken);
          setTokenCheckComplete(true);
          return true;
        } else {
          throw new Error('새로운 액세스 토큰을 받지 못했습니다.');
        }
      } catch (refreshError) {
        console.error('토큰 갱신 실패:', refreshError);

        // 🔧 갱신 실패 시 강제 로그아웃
        forceLogout();
        return false;
      }
    } catch (error) {
      console.error('토큰 확인 중 오류:', error);
      // 🔧 오류 발생 시에도 강제 로그아웃
      forceLogout();
    } finally {
      setIsRefreshingToken(false);
    }

    setTokenCheckComplete(true);
    return false;
  };

  // 🔧 컴포넌트 마운트 시 토큰 확인
  useEffect(() => {
    if (!requireAuth) {
      setTokenCheckComplete(true);
      return;
    }

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setTokenCheckComplete(true);
      return;
    }

    // 🔧 로그인 직후인지 확인 (토큰이 방금 생성되었는지)
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const tokenAge = currentTime - payload.iat; // 토큰 생성 후 경과 시간

      // 토큰이 생성된 지 10초 이내라면 쿠키 확인 건너뛰기
      if (tokenAge < 10) {
        setTokenCheckComplete(true);
        return;
      }
    } catch (e) {
      console.warn('토큰 파싱 실패. 토큰 확인을 진행합니다.');
    }

    // 일반적인 토큰 확인 로직
    refreshTokenIfNeeded();
  }, [requireAuth]);

  // 🔧 로딩 상태들 처리
  if (isLoading || isRefreshingToken || !tokenCheckComplete) {
    return (
      <LoadingSpinner
        message={
          isRefreshingToken
            ? '토큰을 갱신하는 중...'
            : isLoading
              ? '인증 확인 중...'
              : '로딩 중...'
        }
      />
    );
  }

  // 🔧 인증이 필요한데 인증되지 않은 경우
  if (requireAuth && !isAuthenticated) {
    console.log('인증되지 않은 사용자 - 로그인 페이지로 리다이렉트');
    return <Navigate to={redirectTo} replace />;
  }

  // 🔧 특정 사용자 타입이 필요한데 맞지 않는 경우
  if (requiredUserType && userType !== requiredUserType) {
    console.log(`잘못된 사용자 타입: ${userType}, 필요: ${requiredUserType}`);

    const defaultPage =
      userType === 'CONSUMER'
        ? ROUTES.HOME
        : userType === 'MANAGER'
          ? ROUTES.HOME
          : userType === 'ADMIN'
            ? ROUTES.ADMIN.DASHBOARD
            : ROUTES.LOGIN;

    return <Navigate to={defaultPage} replace />;
  }

  return <>{children}</>;
};
