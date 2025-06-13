// utils/googleOAuth.ts - COOP 문제 완전 해결
import { env } from './env';

/**
 * localStorage 기반 메시지 시스템 (COOP 우회)
 */
const OAUTH_MESSAGE_KEY = 'google_oauth_message';
const OAUTH_STATUS_KEY = 'google_oauth_status';

/**
 * 구글 OAuth 로그인 URL 생성
 */
export const generateGoogleOAuthUrl = (
  userType: 'CONSUMER' | 'MANAGER',
): string => {
  const clientId = env.GOOGLE_CLIENT_ID;
  const redirectUri = env.GOOGLE_REDIRECT_URI;

  const params = new URLSearchParams({
    client_id: clientId || '',
    redirect_uri: redirectUri || '',
    response_type: 'code',
    scope: 'openid profile email',
    access_type: 'offline',
    prompt: 'consent',
    state: `userType=${userType}&timestamp=${Date.now()}`, // 타임스탬프 추가
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

/**
 * URL에서 OAuth 응답 파라미터 추출
 */
export const extractOAuthParams = (url: string = window.location.href) => {
  const urlObj = new URL(url);
  const searchParams = urlObj.searchParams;

  return {
    code: searchParams.get('code'),
    error: searchParams.get('error'),
    state: searchParams.get('state'),
  };
};

/**
 * state 파라미터에서 사용자 타입 추출
 */
export const extractUserTypeFromState = (
  state: string | null,
): 'CONSUMER' | 'MANAGER' | null => {
  if (!state) return null;
  const match = state.match(/userType=([^&]+)/);
  return match ? (match[1] as 'CONSUMER' | 'MANAGER') : null;
};

/**
 * 구글 로그인 팝업 열기 (COOP 문제 완전 해결)
 */
export const openGoogleLoginPopup = (
  userType: 'CONSUMER' | 'MANAGER',
  onSuccess: (code: string, userType: 'CONSUMER' | 'MANAGER') => void,
  onError: (error: string) => void,
): void => {
  console.log('🔑 구글 로그인 팝업 시작:', userType);

  const authUrl = generateGoogleOAuthUrl(userType);
  const sessionId = `oauth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 기존 상태 정리
  localStorage.removeItem(OAUTH_MESSAGE_KEY);
  localStorage.removeItem(OAUTH_STATUS_KEY);
  localStorage.setItem(
    OAUTH_STATUS_KEY,
    JSON.stringify({ status: 'pending', sessionId }),
  );

  // 팝업 크기 및 위치 계산
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const popup = window.open(
    authUrl,
    'google-login',
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`,
  );

  if (!popup) {
    onError('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
    return;
  }

  let messageProcessed = false;
  let checkCount = 0;
  const maxChecks = 120; // 60초 (500ms * 120)

  // localStorage 메시지 감지 (COOP 우회)
  const checkMessage = () => {
    if (messageProcessed) return;

    checkCount++;

    try {
      const message = localStorage.getItem(OAUTH_MESSAGE_KEY);
      const status = localStorage.getItem(OAUTH_STATUS_KEY);

      if (message) {
        const data = JSON.parse(message);

        // 세션 ID 검증 (같은 세션의 메시지인지 확인)
        if (status) {
          const statusData = JSON.parse(status);
          if (statusData.sessionId !== sessionId) {
            return;
          }
        }

        localStorage.removeItem(OAUTH_MESSAGE_KEY);
        localStorage.removeItem(OAUTH_STATUS_KEY);
        messageProcessed = true;

        clearInterval(messageInterval);

        // 팝업 닫기 시도 (에러 무시)
        setTimeout(() => {
          try {
            if (popup && typeof popup.close === 'function') {
              popup.close();
            }
          } catch (e: any) {
            // COOP 에러 무시
          }
        }, 100);

        if (data.type === 'GOOGLE_AUTH_SUCCESS') {
          onSuccess(data.code, data.userType);
        } else if (data.type === 'GOOGLE_AUTH_ERROR') {
          onError(data.error);
        }
        return;
      }

      // 타임아웃 체크
      if (checkCount >= maxChecks) {
        localStorage.removeItem(OAUTH_MESSAGE_KEY);
        localStorage.removeItem(OAUTH_STATUS_KEY);
        messageProcessed = true;
        clearInterval(messageInterval);

        try {
          if (popup && typeof popup.close === 'function') {
            popup.close();
          }
        } catch (e: any) {
          // COOP 에러 무시
        }

        onError('로그인 시간이 초과되었습니다. 다시 시도해주세요.');
      }
    } catch (error: any) {
      console.error('❌ OAuth 메시지 체크 에러:', error);
    }
  };

  // 500ms마다 메시지 확인
  const messageInterval = setInterval(checkMessage, 500);
};

/**
 * 구글 로그인 콜백 처리 (GoogleCallback 페이지에서 사용)
 */
export const handleGoogleOAuthCallback = () => {
  console.log('📞 OAuth 콜백 처리 시작');

  const { code, error, state } = extractOAuthParams();
  const userType = extractUserTypeFromState(state);

  let message;

  if (error) {
    message = {
      type: 'GOOGLE_AUTH_ERROR',
      error: `OAuth 인증 실패: ${error}`,
    };
  } else if (!code) {
    message = {
      type: 'GOOGLE_AUTH_ERROR',
      error: '인증 코드를 받지 못했습니다.',
    };
  } else if (!userType) {
    message = {
      type: 'GOOGLE_AUTH_ERROR',
      error: '사용자 타입 정보가 없습니다.',
    };
  } else {
    console.log('✅ OAuth 성공');
    message = {
      type: 'GOOGLE_AUTH_SUCCESS',
      code,
      userType,
    };
  }

  // localStorage로 부모 창에 메시지 전달
  localStorage.setItem(OAUTH_MESSAGE_KEY, JSON.stringify(message));

  // 상태 업데이트
  const currentStatus = localStorage.getItem(OAUTH_STATUS_KEY);
  if (currentStatus) {
    const statusData = JSON.parse(currentStatus);
    statusData.status = 'completed';
    localStorage.setItem(OAUTH_STATUS_KEY, JSON.stringify(statusData));
  }

  // 팝업 닫기 - 지연을 두고 시도
  setTimeout(() => {
    try {
      if (typeof window.close === 'function') {
        window.close();
      }
    } catch (error: any) {
      // COOP 에러 무시
    }
  }, 200);
};

/**
 * 환경 변수 유효성 검사
 */
export const validateGoogleOAuthConfig = (): {
  isValid: boolean;
  missingVars: string[];
} => {
  const requiredVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_REDIRECT_URI'];
  const missingVars = requiredVars.filter(
    (varName) => !env[varName as keyof typeof env],
  );

  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
};

/**
 * OAuth 관련 localStorage 정리
 */
export const cleanupOAuthStorage = () => {
  localStorage.removeItem(OAUTH_MESSAGE_KEY);
  localStorage.removeItem(OAUTH_STATUS_KEY);
};
