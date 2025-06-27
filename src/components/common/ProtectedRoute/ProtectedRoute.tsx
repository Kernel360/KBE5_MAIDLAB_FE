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
  // 🆕 프로필 체크 관련 옵션들
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
  // 🆕 프로필 체크 관련 기본값들
  checkProfile = false,
  redirectIfProfileExists = false,
  redirectIfNoProfile = false,
  profileRedirectTo = ROUTES.HOME,
}) => {
  const { isAuthenticated, userType, isLoading } = useAuth();
  const { fetchProfile: fetchManagerProfile } = useManager();
  const { fetchProfile: fetchConsumerProfile } = useConsumer();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [tokenCheckComplete, setTokenCheckComplete] = useState(false);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [authCheckFailed, setAuthCheckFailed] = useState(false);
  // 🆕 프로필 체크 관련 상태들
  const [profileCheckComplete, setProfileCheckComplete] =
    useState(!checkProfile);
  const [profileCheckFailed, setProfileCheckFailed] = useState(false);

  // 🔥 개선된 쿠키 확인 함수
  const hasRefreshTokenInCookie = () => {
    try {
      const cookies = document.cookie.split(';').map((cookie) => cookie.trim());
      const refreshTokenCookie = cookies.find(
        (cookie) =>
          cookie.startsWith('refreshToken=') ||
          cookie.startsWith('refresh_token=') ||
          cookie.startsWith('REFRESH_TOKEN='),
      );

      console.log('🔍 Cookie check:', {
        allCookies: document.cookie,
        parsedCookies: cookies,
        refreshTokenFound: !!refreshTokenCookie,
        refreshTokenCookie: refreshTokenCookie,
      });

      if (refreshTokenCookie) {
        const cookieValue = refreshTokenCookie.split('=')[1];
        const hasValue =
          cookieValue &&
          cookieValue.trim() !== '' &&
          cookieValue !== 'undefined' &&
          cookieValue !== 'null';

        console.log('🔍 Cookie value check:', {
          cookieValue: cookieValue,
          hasValue: hasValue,
        });

        return hasValue;
      }

      return false;
    } catch (error) {
      console.error('🚨 Cookie parsing error:', error);
      return false;
    }
  };

  // 🆕 완전 로그아웃 처리 함수
  const forceLogout = (reason: string = '인증 실패') => {
    console.log(`🚨 강제 로그아웃: ${reason}`);
    setAuthCheckFailed(true);

    // 모든 localStorage 삭제
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userInfo');
    sessionStorage.clear();

    console.log('🔄 로그인 페이지로 강제 리다이렉트');

    try {
      navigate(ROUTES.LOGIN, {
        replace: true,
        state: { from: location.pathname },
      });

      setTimeout(() => {
        if (window.location.pathname !== ROUTES.LOGIN) {
          console.log('🚨 navigate 실패 - window.location으로 강제 이동');
          window.location.replace(ROUTES.LOGIN);
        }
      }, 300);
    } catch (error) {
      console.error('🚨 navigate 실패:', error);
      window.location.replace(ROUTES.LOGIN);
    }
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

      let tokenNeedsRefresh = false;
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        console.log('🔍 Token expiry check:', {
          exp: payload.exp,
          currentTime: currentTime,
          timeUntilExpiry: payload.exp - currentTime,
          needsRefresh: payload.exp <= currentTime + 300,
        });

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
          console.log('🔄 토큰 갱신 시도 중...');
          const response = await authApi.refreshToken();

          if (response.accessToken) {
            console.log('✅ 토큰 갱신 성공');
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
        console.log('✅ 토큰이 아직 유효함');
        setTokenCheckComplete(true);
        return true;
      }
    } catch (error) {
      console.error('토큰 확인 중 오류:', error);
      forceLogout('토큰 확인 중 오류');
      return false;
    }
  };

  // 🆕 프로필 체크 함수 - 사용자 타입에 따라 다른 API 호출
  const checkUserProfile = async () => {
    // 🔥 수정: requireAuth가 false여도 로그인된 사용자는 프로필 체크
    if (!checkProfile || (!isAuthenticated && requireAuth)) {
      setProfileCheckComplete(true);
      return;
    }

    // 🔥 로그인되지 않은 사용자는 프로필 체크 건너뛰기
    if (!isAuthenticated) {
      setProfileCheckComplete(true);
      return;
    }

    try {
      console.log('🔍 프로필 체크 시작...');
      let profile = null;

      // 🔥 사용자 타입에 따라 다른 프로필 API 호출
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

      // 🔥 프로필 존재 여부를 더 안전하게 체크
      console.log('🔍 프로필 체크 결과:', {
        profile: profile,
        profileKeys: profile ? Object.keys(profile) : [],
        profileType: typeof profile,
        isArray: Array.isArray(profile),
        redirectIfNoProfile: redirectIfNoProfile,
        redirectIfProfileExists: redirectIfProfileExists,
      });

      const hasProfile =
        profile &&
        (() => {
          try {
            // 타입 안전을 위해 any로 캐스팅
            const profileData = profile as any;

            console.log('🔍 프로필 데이터 상세:', {
              userType: userType,
              requiredUserType: requiredUserType,
              profileData: profileData,
            });

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

              console.log('🔍 매니저 프로필 체크:', {
                hasServices,
                hasRegions,
                hasSchedules,
                services: profileData.services,
                regions: profileData.regions,
                schedules: profileData.schedules,
              });

              return hasServices && hasRegions && hasSchedules;
            }

            // 소비자의 경우: 주소 정보가 등록되어 있어야 함
            if (requiredUserType === 'CONSUMER' || userType === 'CONSUMER') {
              const hasAddress =
                profileData.address && profileData.address.trim() !== '';

              console.log('🔍 소비자 프로필 체크:', {
                hasAddress,
                address: profileData.address,
              });

              return hasAddress;
            }

            // 기타 경우: 기본 체크
            const hasBasicProfile =
              (profileData.managerId && profileData.managerId) ||
              (profileData.consumerId && profileData.consumerId) ||
              (profileData.id && profileData.id) ||
              (profileData.userId && profileData.userId) ||
              (profileData.userid && profileData.userid);

            console.log('🔍 기본 프로필 체크:', {
              hasBasicProfile,
              managerId: profileData.managerId,
              consumerId: profileData.consumerId,
              id: profileData.id,
              userId: profileData.userId,
              userid: profileData.userid,
            });

            return hasBasicProfile;
          } catch (error) {
            console.error('🚨 프로필 체크 중 오류:', error);
            return false;
          }
        })();

      console.log('🔍 프로필 존재 여부:', {
        hasProfile: hasProfile,
        shouldRedirectIfExists: redirectIfProfileExists && hasProfile,
        shouldRedirectIfNoProfile: redirectIfNoProfile && !hasProfile,
      });

      if (redirectIfProfileExists && hasProfile) {
        console.log('❌ 프로필이 이미 존재함 - 리다이렉트');
        showToast('이미 프로필이 등록되어 있습니다.', 'error');
        navigate(profileRedirectTo, { replace: true });
        return;
      }

      if (redirectIfNoProfile && !hasProfile) {
        console.log('❌ 프로필이 없음 - 리다이렉트');
        showToast('프로필 등록이 필요합니다.', 'error');

        // 🔥 사용자 타입에 따라 다른 프로필 등록 페이지로 이동
        const profileSetupRoute =
          (requiredUserType || userType) === 'MANAGER'
            ? '/manager/profile/setup'
            : '/consumer/profile/setup';

        navigate(profileSetupRoute, { replace: true });
        return;
      }

      console.log('✅ 프로필 체크 완료');
      setProfileCheckComplete(true);
    } catch (error) {
      console.error('프로필 체크 중 오류:', error);
      // 프로필 체크 실패는 치명적이지 않으므로 계속 진행
      setProfileCheckComplete(true);
    }
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

    if (authCheckFailed) {
      return;
    }

    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const tokenAge = currentTime - payload.iat;

      console.log('🔍 Token age check:', {
        iat: payload.iat,
        currentTime: currentTime,
        tokenAge: tokenAge,
        isRecentToken: tokenAge < 10,
      });

      if (tokenAge < 10) {
        console.log('✅ 최근에 생성된 토큰 - 쿠키 확인 건너뛰기');
        setTokenCheckComplete(true);
        return;
      }
    } catch (e) {
      console.warn('토큰 파싱 실패. 토큰 확인을 진행합니다.');
    }

    refreshTokenIfNeeded();
  }, [requireAuth, authCheckFailed]);

  // 🆕 토큰 체크 완료 후 프로필 체크 실행
  useEffect(() => {
    if (
      tokenCheckComplete &&
      isAuthenticated &&
      !isLoading &&
      !authCheckFailed
    ) {
      checkUserProfile();
    }
  }, [
    tokenCheckComplete,
    isAuthenticated,
    isLoading,
    authCheckFailed,
    checkProfile,
    location.pathname,
  ]); // 🔥 location.pathname 추가

  // 🆕 인증 실패 상태면 즉시 null 반환 (profileCheckFailed 제거)
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
    console.log('인증되지 않은 사용자 - 로그인 페이지로 리다이렉트');
    return (
      <Navigate to={redirectTo} replace state={{ from: location.pathname }} />
    );
  }

  // 특정 사용자 타입이 필요한데 맞지 않는 경우
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

// 🔥 추가: 쿠키 디버깅 유틸리티
export const debugCookies = () => {
  const allCookies = document.cookie;
  const cookieArray = allCookies.split(';').map((cookie) => cookie.trim());

  console.log('🔍 Cookie Debug:', {
    raw: allCookies,
    parsed: cookieArray,
    refreshToken: cookieArray.find((c) => c.startsWith('refreshToken')),
    refresh_token: cookieArray.find((c) => c.startsWith('refresh_token')),
    REFRESH_TOKEN: cookieArray.find((c) => c.startsWith('REFRESH_TOKEN')),
  });

  return {
    all: allCookies,
    array: cookieArray,
  };
};

// 개발 환경에서 전역 함수로 추가
if (import.meta.env.DEV) {
  (window as any).debugCookies = debugCookies;
}
