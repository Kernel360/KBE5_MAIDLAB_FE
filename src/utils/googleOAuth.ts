import { env } from './env';

/**
 * 구글 OAuth 로그인 URL 생성
 */
export const generateGoogleOAuthUrl = (
  userType: 'CONSUMER' | 'MANAGER',
): string => {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID || '',
    redirect_uri: env.GOOGLE_REDIRECT_URI || '',
    response_type: 'code',
    scope: 'openid profile email',
    access_type: 'offline',
    prompt: 'consent',
    state: `userType=${userType}`, // 사용자 타입을 state로 전달
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
 * 구글 로그인 팝업 열기
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

  const popup = window.open(
    authUrl,
    'google-login',
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`,
  );

  if (!popup) {
    onError('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
    return;
  }

  // 팝업 상태 모니터링
  const checkClosed = setInterval(() => {
    if (popup.closed) {
      clearInterval(checkClosed);
      onError('로그인이 취소되었습니다.');
    }
  }, 1000);

  // 메시지 리스너 (팝업에서 부모 창으로 메시지 전송)
  const messageListener = (event: MessageEvent) => {
    // 보안: origin 체크
    if (event.origin !== window.location.origin) {
      return;
    }

    if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
      clearInterval(checkClosed);
      popup.close();
      window.removeEventListener('message', messageListener);
      onSuccess(event.data.code, event.data.userType);
    } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
      clearInterval(checkClosed);
      popup.close();
      window.removeEventListener('message', messageListener);
      onError(event.data.error);
    }
  };

  window.addEventListener('message', messageListener);
};

/**
 * 구글 로그인 콜백 처리 (리다이렉트 페이지에서 사용)
 */
export const handleGoogleOAuthCallback = () => {
  const { code, error, state } = extractOAuthParams();
  const userType = extractUserTypeFromState(state);

  if (error) {
    // 부모 창에 에러 전송
    window.opener?.postMessage(
      {
        type: 'GOOGLE_AUTH_ERROR',
        error: `OAuth 인증 실패: ${error}`,
      },
      window.location.origin,
    );
    window.close();
    return;
  }

  if (!code) {
    window.opener?.postMessage(
      {
        type: 'GOOGLE_AUTH_ERROR',
        error: '인증 코드를 받지 못했습니다.',
      },
      window.location.origin,
    );
    window.close();
    return;
  }

  if (!userType) {
    window.opener?.postMessage(
      {
        type: 'GOOGLE_AUTH_ERROR',
        error: '사용자 타입 정보가 없습니다.',
      },
      window.location.origin,
    );
    window.close();
    return;
  }

  // 부모 창에 성공 메시지 전송
  window.opener?.postMessage(
    {
      type: 'GOOGLE_AUTH_SUCCESS',
      code,
      userType,
    },
    window.location.origin,
  );

  window.close();
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
