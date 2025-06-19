import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/constants';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';

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

  // 개발 환경에서는 인증 체크 건너뛰기
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    return <>{children}</>;
  }

  // 로딩 중이면 스피너 표시
  if (isLoading) {
    return <LoadingSpinner message="인증 확인 중..." />;
  }

  // 인증이 필요한데 로그인하지 않은 경우
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // 특정 사용자 타입이 필요한데 다른 타입인 경우
  if (requiredUserType && userType !== requiredUserType) {
    // 사용자 타입에 따른 기본 페이지로 리다이렉트
    const defaultPage =
      userType === 'CONSUMER'
        ? ROUTES.CONSUMER.MYPAGE
        : userType === 'MANAGER'
          ? ROUTES.MANAGER.MYPAGE
          : ROUTES.LOGIN;


    return <Navigate to={defaultPage} replace />;
  }

  return <>{children}</>;
};
