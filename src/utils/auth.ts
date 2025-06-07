import { tokenStorage, userStorage } from './storage';
import { USER_TYPES } from '@/constants/user';
import { env } from './env';

/**
 * 로그인 상태 확인
 */
export const isAuthenticated = (): boolean => {
  const token = tokenStorage.getAccessToken();
  return !!token;
};

/**
 * 사용자 타입 확인
 */
export const getUserType = (): string | null => {
  return userStorage.getUserType();
};

/**
 * 특정 사용자 타입인지 확인
 */
export const isUserType = (userType: string): boolean => {
  return getUserType() === userType;
};

/**
 * 소비자인지 확인
 */
export const isConsumer = (): boolean => {
  return isUserType(USER_TYPES.CONSUMER);
};

/**
 * 매니저인지 확인
 */
export const isManager = (): boolean => {
  return isUserType(USER_TYPES.MANAGER);
};

/**
 * 관리자인지 확인
 */
export const isAdmin = (): boolean => {
  return isUserType(USER_TYPES.ADMIN);
};

/**
 * 현재 사용자 정보 가져오기
 */
export const getCurrentUser = <T>(): T | null => {
  return userStorage.getUserInfo<T>();
};

/**
 * 로그인 처리
 */
export const login = (
  accessToken: string,
  refreshToken: string,
  userType: string,
  userInfo?: any,
): void => {
  tokenStorage.setAccessToken(accessToken);
  tokenStorage.setRefreshToken(refreshToken);
  userStorage.setUserType(userType);

  if (userInfo) {
    userStorage.setUserInfo(userInfo);
  }
};

/**
 * 로그아웃 처리
 */
export const logout = (): void => {
  tokenStorage.clearTokens();
  userStorage.clearUserData();
};

/**
 * 토큰 유효성 검사 (간단한 형태 체크)
 */
export const isValidToken = (token: string): boolean => {
  if (!token) return false;

  try {
    // JWT 토큰인지 기본적인 형태 체크
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Base64 디코딩 테스트
    const payload = JSON.parse(atob(parts[1]));

    // 만료 시간 체크
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * 토큰에서 사용자 정보 추출
 */
export const decodeToken = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
};

/**
 * 토큰 만료 시간 확인
 */
export const getTokenExpiry = (token: string): Date | null => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;

  return new Date(decoded.exp * 1000);
};

/**
 * 토큰이 곧 만료되는지 확인 (5분 이내)
 */
export const isTokenExpiringSoon = (token: string): boolean => {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true;

  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
  return expiry <= fiveMinutesFromNow;
};

/**
 * 권한 확인 (특정 역할이나 권한 체크)
 */
export const hasPermission = (permission: string): boolean => {
  const user = getCurrentUser<any>();
  if (!user || !user.permissions) return false;

  return user.permissions.includes(permission);
};

/**
 * 페이지 접근 권한 확인
 */
export const canAccessPage = (requiredUserType?: string): boolean => {
  // 로그인이 필요한 페이지
  if (!isAuthenticated()) return false;

  // 특정 사용자 타입이 필요한 페이지
  if (requiredUserType && !isUserType(requiredUserType)) return false;

  return true;
};

/**
 * 소셜 로그인 URL 생성
 */
export const getSocialLoginUrl = (
  provider: 'KAKAO' | 'GOOGLE',
  userType: string,
): string => {
  const clientId =
    provider === 'GOOGLE' ? env.GOOGLE_CLIENT_ID : env.KAKAO_CLIENT_ID;
  const redirectUri =
    provider === 'GOOGLE' ? env.GOOGLE_REDIRECT_URI : env.KAKAO_REDIRECT_URI;

  if (!clientId) {
    throw new Error(`${provider} client ID is not configured`);
  }

  return `${env.API_BASE_URL}/oauth2/authorization/${provider.toLowerCase()}?userType=${userType}&client_id=${clientId}&redirect_uri=${redirectUri}`;
};

/**
 * 비밀번호 강도 체크
 */
export const checkPasswordStrength = (
  password: string,
): {
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  // 길이 체크
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('8자 이상 입력해주세요');
  }

  // 대문자 포함
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('대문자를 포함해주세요');
  }

  // 소문자 포함
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('소문자를 포함해주세요');
  }

  // 숫자 포함
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('숫자를 포함해주세요');
  }

  // 특수문자 포함
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('특수문자를 포함해주세요');
  }

  return { score, feedback };
};

/**
 * 세션 타임아웃 체크
 */
export const checkSessionTimeout = (): boolean => {
  const token = tokenStorage.getAccessToken();
  if (!token) return true;

  return !isValidToken(token);
};

/**
 * 자동 로그아웃 설정
 */
export const setupAutoLogout = (timeoutMinutes: number = 30): void => {
  let timeout: NodeJS.Timeout;

  const resetTimer = () => {
    clearTimeout(timeout);
    timeout = setTimeout(
      () => {
        logout();
        window.location.href = '/login';
      },
      timeoutMinutes * 60 * 1000,
    );
  };

  // 사용자 활동 감지
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  events.forEach((event) => {
    document.addEventListener(event, resetTimer, true);
  });

  resetTimer();
};

/**
 * 기기 정보 가져오기 (로그인 이력용)
 */
export const getDeviceInfo = (): {
  userAgent: string;
  platform: string;
  language: string;
  timezone: string;
} => {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};
