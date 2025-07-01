import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useManager, useConsumer, useToast } from '@/hooks';
import { ROUTES } from '@/constants';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';
import { authApi } from '@/apis/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredUserType?: 'CONSUMER' | 'MANAGER' | 'ADMIN';
  redirectTo?: string;
  // 프로필 체크 관련 옵션들
  checkProfile?: boolean; // 프로필 존재 여부를 체크할지
  redirectIfProfileExists?: boolean; // 프로필이 이미 있으면 리다이렉트할지
  redirectIfNoProfile?: boolean; // 프로필이 없으면 리다이렉트할지
  profileRedirectTo?: string; // 프로필 관련 리다이렉트 경로
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredUserType,
  redirectTo = ROUTES.LOGIN,
  checkProfile = false,
  redirectIfProfileExists = false,
  redirectIfNoProfile = false,
  profileRedirectTo = ROUTES.HOME,
}) => {
  // ✅ 모든 hooks를 맨 위에서 호출 (early return 전에)
  const { isAuthenticated, userType, isLoading } = useAuth();
  const { fetchProfile: fetchManagerProfile } = useManager();
  const { fetchProfile: fetchConsumerProfile } = useConsumer();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [tokenCheckComplete, setTokenCheckComplete] = useState(false);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [authCheckFailed, setAuthCheckFailed] = useState(false);
  const [profileCheckComplete, setProfileCheckComplete] =
    useState(!checkProfile);

  // ✅ 모든 useEffect도 early return 전에 호출
  // 개선된 쿠키 확인 함수
  const hasRefreshTokenInCookie = () => {
    try {
      const cookies = document.cookie.split(';').map((cookie) => cookie.trim());
      const refreshTokenCookie = cookies.find(
        (cookie) =>
          cookie.startsWith('refreshToken=') ||
          cookie.startsWith('refresh_token=') ||
          cookie.startsWith('REFRESH_TOKEN='),
      );

      if (refreshTokenCookie) {
        const cookieValue = refreshTokenCookie.split('=')[1];
        const hasValue =
          cookieValue &&
          cookieValue.trim() !== '' &&
          cookieValue !== 'undefined' &&
          cookieValue !== 'null';

        return hasValue;
      }

      return false;
    } catch (error) {
      console.error('🚨 Cookie parsing error:', error);
      return false;
    }
  };

  // 완전 로그아웃 처리 함수
  const forceLogout = (reason: string = '인증 실패') => {
    setAuthCheckFailed(true);

    // 모든 localStorage 삭제
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userInfo');
    sessionStorage.clear();

    try {
      navigate(ROUTES.LOGIN, {
        replace: true,
        state: { from: location.pathname },
      });

      setTimeout(() => {
        if (window.location.pathname !== ROUTES.LOGIN) {
          window.location.replace(ROUTES.LOGIN);
        }
      }, 300);
    } catch (error) {
      console.error('🚨 navigate 실패:', error);
      window.location.replace(ROUTES.LOGIN);
    }
  };

  // 토큰 갱신 함수
  const refreshTokenIfNeeded = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        console.warn('액세스 토큰이 없습니다.');
        setTokenCheckComplete(true);
        return false;
      }

      let tokenNeedsRefresh = false;
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        if (payload.exp <= currentTime + 300) {
          tokenNeedsRefresh = true;
        }
      } catch (e) {
        console.warn('토큰 파싱 실패. 갱신을 시도합니다.');
        tokenNeedsRefresh = true;
      }

      if (tokenNeedsRefresh) {
        const hasCookie = hasRefreshTokenInCookie();

        if (!hasCookie) {
          forceLogout('리프레시 토큰이 쿠키에 없음');
          return false;
        }

        if (authCheckFailed) {
          return false;
        }

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
        } catch (refreshError: any) {
          console.error('토큰 갱신 실패:', refreshError);

          if (refreshError.response?.status === 401) {
            forceLogout('토큰 갱신 실패 (401)');
          } else {
            forceLogout('토큰 갱신 실패');
          }
          return false;
        } finally {
          setIsRefreshingToken(false);
        }
      } else {
        setTokenCheckComplete(true);
        return true;
      }
    } catch (error) {
      console.error('토큰 확인 중 오류:', error);
      forceLogout('토큰 확인 중 오류');
      return false;
    }
  };

  // 프로필 체크 함수
  const checkUserProfile = async () => {
    if (!checkProfile || (!isAuthenticated && requireAuth)) {
      setProfileCheckComplete(true);
      return;
    }

    if (!isAuthenticated) {
      setProfileCheckComplete(true);
      return;
    }

    try {
      let profile = null;

      // 사용자 타입에 따라 다른 프로필 API 호출
      if (requiredUserType === 'MANAGER') {
        profile = await fetchManagerProfile();
      } else if (requiredUserType === 'CONSUMER') {
        profile = await fetchConsumerProfile();
      } else {
        // 사용자 타입이 명시되지 않은 경우 현재 로그인된 사용자 타입 사용
        if (userType === 'MANAGER') {
          profile = await fetchManagerProfile();
        } else if (userType === 'CONSUMER') {
          profile = await fetchConsumerProfile();
        }
      }

      const hasProfile =
        profile &&
        (() => {
          try {
            const profileData = profile as any;

            // 매니저의 경우: 서비스, 지역, 스케줄이 모두 등록되어 있어야 함
            if (requiredUserType === 'MANAGER' || userType === 'MANAGER') {
              const hasServices =
                profileData.services &&
                Array.isArray(profileData.services) &&
                profileData.services.length > 0;
              const hasRegions =
                profileData.regions &&
                Array.isArray(profileData.regions) &&
                profileData.regions.length > 0;
              const hasSchedules =
                profileData.schedules &&
                Array.isArray(profileData.schedules) &&
                profileData.schedules.length > 0;

              return hasServices && hasRegions && hasSchedules;
            }

            // 소비자의 경우: 주소 정보가 등록되어 있어야 함
            if (requiredUserType === 'CONSUMER' || userType === 'CONSUMER') {
              const hasAddress =
                profileData.address && profileData.address.trim() !== '';
              return hasAddress;
            }

            // 기타 경우: 기본 체크
            const hasBasicProfile =
              (profileData.managerId && profileData.managerId) ||
              (profileData.consumerId && profileData.consumerId) ||
              (profileData.id && profileData.id) ||
              (profileData.userId && profileData.userId) ||
              (profileData.userid && profileData.userid);

            return hasBasicProfile;
          } catch (error) {
            console.error('🚨 프로필 체크 중 오류:', error);
            return false;
          }
        })();

      if (redirectIfProfileExists && hasProfile) {
        showToast('이미 프로필이 등록되어 있습니다.', 'error');
        navigate(profileRedirectTo, { replace: true });
        return;
      }

      if (redirectIfNoProfile && !hasProfile) {
        showToast('프로필 등록이 필요합니다.', 'error');

        // 사용자 타입에 따라 다른 프로필 등록 페이지로 이동
        const profileSetupRoute =
          (requiredUserType || userType) === 'MANAGER'
            ? '/manager/profile/setup'
            : '/consumer/profile/setup';

        navigate(profileSetupRoute, { replace: true });
        return;
      }

      setProfileCheckComplete(true);
    } catch (error) {
      console.error('프로필 체크 중 오류:', error);
      // 프로필 체크 실패는 치명적이지 않으므로 계속 진행
      setProfileCheckComplete(true);
    }
  };

  // 컴포넌트 마운트 시 토큰 확인
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

    if (authCheckFailed) {
      return;
    }

    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const tokenAge = currentTime - payload.iat;

      if (tokenAge < 10) {
        setTokenCheckComplete(true);
        return;
      }
    } catch (e) {
      console.warn('토큰 파싱 실패. 토큰 확인을 진행합니다.');
    }

    refreshTokenIfNeeded();
  }, [requireAuth, authCheckFailed]);

  // 토큰 체크 완료 후 프로필 체크 실행
  useEffect(() => {
    if (
      tokenCheckComplete &&
      isAuthenticated &&
      !isLoading &&
      !authCheckFailed &&
      checkProfile
    ) {
      checkUserProfile();
    } else {
      // ✅ tokenCheckComplete가 true이고 로딩이 끝났으면 완료 처리
      if (tokenCheckComplete && !isLoading) {
        setProfileCheckComplete(true);
      }
    }
  }, [
    tokenCheckComplete,
    isAuthenticated,
    isLoading,
    authCheckFailed,
    checkProfile,
  ]);

  // ✅ 이제 모든 hooks 호출 후에 조건부 렌더링
  // 비로그인 상태에서 프로필 체크가 필요한 경우 즉시 완료 처리
  if (!requireAuth && !isAuthenticated && !isLoading) {
    return <>{children}</>;
  }

  // 로그인된 사용자지만 토큰 체크가 완료되지 않은 경우 로딩
  if (isAuthenticated && !tokenCheckComplete) {
    return <LoadingSpinner message="인증 확인 중..." />;
  }

  // 인증 실패 상태면 즉시 null 반환
  if (authCheckFailed) {
    return null;
  }

  // 로딩 상태들 처리
  if (
    isLoading ||
    isRefreshingToken ||
    !tokenCheckComplete ||
    !profileCheckComplete
  ) {
    return (
      <LoadingSpinner
        message={
          isRefreshingToken
            ? '토큰을 갱신하는 중...'
            : !profileCheckComplete
              ? '프로필 정보를 확인하는 중...'
              : isLoading
                ? '인증 확인 중...'
                : '로딩 중...'
        }
      />
    );
  }

  // 인증이 필요한데 인증되지 않은 경우
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate to={redirectTo} replace state={{ from: location.pathname }} />
    );
  }

  // 특정 사용자 타입이 필요한데 맞지 않는 경우
  if (requiredUserType && userType !== requiredUserType) {
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
