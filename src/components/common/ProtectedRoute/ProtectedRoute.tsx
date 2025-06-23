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

  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    return <>{children}</>;
  }

  if (isLoading) {
    return <LoadingSpinner message="인증 확인 중..." />;
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredUserType && userType !== requiredUserType) {
    const defaultPage =
      userType === 'CONSUMER'
        ? ROUTES.HOME
        : userType === 'MANAGER'
          ? ROUTES.HOME
          : ROUTES.LOGIN;

    return <Navigate to={defaultPage} replace />;
  }

  return <>{children}</>;
};
