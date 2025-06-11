import { env } from './env';

/**
 * 팝업 통신을 위한 localStorage 기반 메시지 시스템
 */
const OAUTH_MESSAGE_KEY = 'google_oauth_message';
const OAUTH_CALLBACK_KEY = 'google_oauth_callback_processed';

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
    state: `userType=${userType}`, // 사용자 타입을 state로 전달
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return authUrl;
};

/**
 * URL에서 OAuth 응답 파라미터 추출
 */
export const extractOAuthParams = (url: string = window.location.href) => {
  const urlObj = new URL(url);
  const searchParams = urlObj.searchParams;

  const params = {
    code: searchParams.get('code'),
    error: searchParams.get('error'),
    state: searchParams.get('state'),
  };

  return params;
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
 * 구글 로그인 팝업 열기 (완전히 개선된 버전)
 */
export const openGoogleLoginPopup = (
  userType: 'CONSUMER' | 'MANAGER',
  onSuccess: (code: string, userType: 'CONSUMER' | 'MANAGER') => void,
  onError: (error: string) => void,
): void => {
  const authUrl = generateGoogleOAuthUrl(userType);

  // 팝업 크기 및 위치 계산
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  // 기존 메시지 정리
  localStorage.removeItem(OAUTH_MESSAGE_KEY);
  localStorage.removeItem(OAUTH_CALLBACK_KEY);

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

  // localStorage를 통한 메시지 감지
  const checkMessage = () => {
    if (messageProcessed) return true;

    const message = localStorage.getItem(OAUTH_MESSAGE_KEY);
    if (message) {
      try {
        const data = JSON.parse(message);
        localStorage.removeItem(OAUTH_MESSAGE_KEY);
        messageProcessed = true;

        if (data.type === 'GOOGLE_AUTH_SUCCESS') {
          onSuccess(data.code, data.userType);
        } else if (data.type === 'GOOGLE_AUTH_ERROR') {
          onError(data.error);
        }

        return true; // 메시지 처리됨
      } catch (error) {
        console.error('OAuth message parsing error:', error);
      }
    }
    return false; // 메시지 없음
  };

  // 주기적으로 메시지 확인
  const messageInterval = setInterval(() => {
    if (checkMessage()) {
      clearInterval(messageInterval);
      clearInterval(timeoutInterval);

      // 팝업 닫기 시도
      try {
        if (popup && !popup.closed) {
          popup.close();
        }
      } catch (error) {
        // 팝업 닫기 실패해도 무시
      }
    }
  }, 500);

  // 30초 타임아웃 설정 (COOP 문제로 popup.closed 접근 불가하므로)
  const timeoutInterval = setTimeout(() => {
    if (!messageProcessed) {
      clearInterval(messageInterval);
      messageProcessed = true;

      // 콜백이 처리되었는지 확인
      const callbackProcessed = localStorage.getItem(OAUTH_CALLBACK_KEY);
      if (!callbackProcessed) {
        onError('로그인 시간이 초과되었습니다. 다시 시도해주세요.');
      }

      // 팝업 닫기 시도
      try {
        if (popup && !popup.closed) {
          popup.close();
        }
      } catch (error) {
        // 팝업 닫기 실패해도 무시
      }
    }
  }, 30000); // 30초 타임아웃
};

/**
 * 구글 로그인 콜백 처리 (수정된 버전)
 */
export const handleGoogleOAuthCallback = () => {
  const { code, error, state } = extractOAuthParams();
  const userType = extractUserTypeFromState(state);

  // 콜백 처리됨을 표시
  localStorage.setItem(OAUTH_CALLBACK_KEY, 'true');

  let message;

  if (error) {
    console.error('❌ OAuth 에러:', error);
    message = {
      type: 'GOOGLE_AUTH_ERROR',
      error: `OAuth 인증 실패: ${error}`,
    };
  } else if (!code) {
    console.error('❌ 인증 코드 없음');
    message = {
      type: 'GOOGLE_AUTH_ERROR',
      error: '인증 코드를 받지 못했습니다.',
    };
  } else if (!userType) {
    console.error('❌ 사용자 타입 없음');
    message = {
      type: 'GOOGLE_AUTH_ERROR',
      error: '사용자 타입 정보가 없습니다.',
    };
  } else {
    message = {
      type: 'GOOGLE_AUTH_SUCCESS',
      code,
      userType,
    };
  }

  // localStorage를 통해 메시지 전달
  localStorage.setItem(OAUTH_MESSAGE_KEY, JSON.stringify(message));

  // 팝업 닫기
  try {
    window.close();
  } catch (error) {}

  // fallback: postMessage도 시도 (COOP가 허용하는 경우)
  try {
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(message, window.location.origin);
    }
  } catch (error) {}
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
  localStorage.removeItem(OAUTH_CALLBACK_KEY);
};
