import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [tokenCheckComplete, setTokenCheckComplete] = useState(false);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [authCheckFailed, setAuthCheckFailed] = useState(false);

  // 🔥 개선된 쿠키 확인 함수
  const hasRefreshTokenInCookie = () => {
    try {
      // 🆕 더 정확한 쿠키 파싱
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
        // 쿠키 값이 비어있지 않은지 확인
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

  // 🆕 완전 로그아웃 처리 함수 - 쿠키 체크 로직 개선
  const forceLogout = (reason: string = '인증 실패') => {
    console.log(`🚨 강제 로그아웃: ${reason}`);

    // 🆕 인증 실패 상태 설정으로 렌더링 중단
    setAuthCheckFailed(true);

    // 모든 localStorage 삭제
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userInfo');
    sessionStorage.clear();

    // 🆕 즉시 로그인 페이지로 강제 이동
    console.log('🔄 로그인 페이지로 강제 리다이렉트');

    try {
      // 방법 1: navigate 사용
      navigate(ROUTES.LOGIN, {
        replace: true,
        state: { from: location.pathname },
      });

      // 🆕 방법 2: 0.3초 후에도 여전히 현재 페이지에 있으면 window.location 사용
      setTimeout(() => {
        if (window.location.pathname !== ROUTES.LOGIN) {
          console.log('🚨 navigate 실패 - window.location으로 강제 이동');
          window.location.replace(ROUTES.LOGIN);
        }
      }, 300);
    } catch (error) {
      console.error('🚨 navigate 실패:', error);
      // 즉시 window.location 사용
      window.location.replace(ROUTES.LOGIN);
    }
  };

  // 🔧 토큰 갱신 함수 - 🆕 쿠키 체크 로직 수정
  const refreshTokenIfNeeded = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        console.warn('액세스 토큰이 없습니다.');
        setTokenCheckComplete(true);
        return false;
      }

      // 🆕 JWT 토큰 만료 확인을 먼저 수행
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

        // 토큰이 5분 이내에 만료되거나 이미 만료된 경우
        if (payload.exp <= currentTime + 300) {
          tokenNeedsRefresh = true;
        }
      } catch (e) {
        console.warn('토큰 파싱 실패. 갱신을 시도합니다.');
        tokenNeedsRefresh = true;
      }

      // 🆕 토큰 갱신이 필요한 경우에만 쿠키 체크
      if (tokenNeedsRefresh) {
        const hasCookie = hasRefreshTokenInCookie();

        if (!hasCookie) {
          forceLogout('리프레시 토큰이 쿠키에 없음');
          return false;
        }

        // 🆕 이미 인증 실패 상태면 더 이상 진행하지 않음
        if (authCheckFailed) {
          return false;
        }

        // 토큰 갱신 시도
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

          // 🆕 401 에러인 경우 특별 처리
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
        // 토큰이 아직 유효한 경우
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

    // 🆕 이미 인증 실패 상태면 체크하지 않음
    if (authCheckFailed) {
      return;
    }

    // 🆕 로그인 직후인지 확인 (토큰이 방금 생성되었는지)
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const tokenAge = currentTime - payload.iat; // 토큰 생성 후 경과 시간

      console.log('🔍 Token age check:', {
        iat: payload.iat,
        currentTime: currentTime,
        tokenAge: tokenAge,
        isRecentToken: tokenAge < 10,
      });

      // 토큰이 생성된 지 10초 이내라면 쿠키 확인 건너뛰기
      if (tokenAge < 10) {
        console.log('✅ 최근에 생성된 토큰 - 쿠키 확인 건너뛰기');
        setTokenCheckComplete(true);
        return;
      }
    } catch (e) {
      console.warn('토큰 파싱 실패. 토큰 확인을 진행합니다.');
    }

    // 일반적인 토큰 확인 로직
    refreshTokenIfNeeded();
  }, [requireAuth, authCheckFailed]);

  // 🆕 인증 실패 상태면 즉시 null 반환 (렌더링 중단)
  if (authCheckFailed) {
    return null;
  }

  // 로딩 상태들 처리
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
