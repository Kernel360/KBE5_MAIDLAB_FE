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
    state: `userType=${userType}&timestamp=${Date.now()}`,
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
  const sessionId = `oauth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 상태 변수들
  let messageProcessed = false;
  let pollInterval: NodeJS.Timeout;
  let fastPollInterval: NodeJS.Timeout;
  let timeoutHandle: NodeJS.Timeout;
  let popup: Window | null = null;

  // ✅ 통합 정리 함수
  const cleanup = () => {
    if (messageProcessed) return;

    messageProcessed = true;

    // 타이머들 정리
    clearInterval(pollInterval);
    clearInterval(fastPollInterval);
    clearTimeout(timeoutHandle);

    // 이벤트 리스너 제거
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('beforeunload', handlePageUnload);

    // localStorage 정리
    localStorage.removeItem(OAUTH_MESSAGE_KEY);
    localStorage.removeItem(OAUTH_STATUS_KEY);
  };

  // ✅ 메시지 처리 통합 함수
  const processMessage = (messageData: any) => {
    if (messageProcessed) return;

    cleanup();

    // 팝업 닫기 (지연 처리)
    setTimeout(() => {
      try {
        if (popup && typeof popup.close === 'function') {
          popup.close();
        }
      } catch (e: any) {}
    }, 200);

    // 콜백 실행
    if (messageData.type === 'GOOGLE_AUTH_SUCCESS') {
      onSuccess(messageData.code, messageData.userType);
    } else {
      onError(messageData.error || 'OAuth 인증에 실패했습니다.');
    }
  };

  // ✅ localStorage 이벤트 리스너 (즉시 감지)
  const handleStorageChange = (e: StorageEvent) => {
    if (messageProcessed) return;

    if (e.key === OAUTH_MESSAGE_KEY && e.newValue) {
      try {
        const data = JSON.parse(e.newValue);

        // 세션 ID 확인
        const status = localStorage.getItem(OAUTH_STATUS_KEY);
        if (status) {
          const statusData = JSON.parse(status);
          if (statusData.sessionId !== sessionId) {
            return;
          }
        }

        processMessage(data);
      } catch (error: any) {
        console.error('❌ localStorage 이벤트 파싱 에러:', error);
      }
    }
  };

  // ✅ 빠른 폴링 (처음 30초간 500ms마다)
  let fastPollCount = 0;
  const maxFastPolls = 60; // 30초

  const fastPollForMessage = () => {
    if (messageProcessed) return;

    fastPollCount++;

    try {
      const message = localStorage.getItem(OAUTH_MESSAGE_KEY);
      if (message) {
        const data = JSON.parse(message);

        // 세션 ID 확인
        const status = localStorage.getItem(OAUTH_STATUS_KEY);
        if (status) {
          const statusData = JSON.parse(status);
          if (statusData.sessionId !== sessionId) {
            return;
          }
        }

        processMessage(data);
        return;
      }
    } catch (error: any) {
      console.error('❌ 빠른 폴링 에러:', error);
    }

    // 빠른 폴링 종료
    if (fastPollCount >= maxFastPolls) {
      clearInterval(fastPollInterval);
    }
  };

  // ✅ 느린 폴링 백업 (3초마다)
  let slowPollCount = 0;

  const slowPollForMessage = () => {
    if (messageProcessed) return;

    slowPollCount++;

    try {
      const message = localStorage.getItem(OAUTH_MESSAGE_KEY);
      if (message) {
        const data = JSON.parse(message);

        // 세션 ID 확인
        const status = localStorage.getItem(OAUTH_STATUS_KEY);
        if (status) {
          const statusData = JSON.parse(status);
          if (statusData.sessionId !== sessionId) {
            return;
          }
        }

        processMessage(data);
        return;
      }
    } catch (error: any) {
      console.error('❌ 느린 폴링 에러:', error);
    }
  };

  // ✅ 페이지 종료 처리
  const handlePageUnload = () => {
    cleanup();
  };

  // 기존 상태 정리
  localStorage.removeItem(OAUTH_MESSAGE_KEY);
  localStorage.removeItem(OAUTH_STATUS_KEY);
  localStorage.setItem(
    OAUTH_STATUS_KEY,
    JSON.stringify({ status: 'pending', sessionId, startTime: Date.now() }),
  );

  // 이벤트 리스너 등록
  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('beforeunload', handlePageUnload);

  // 팝업 크기 및 위치 계산
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  // 팝업 열기
  popup = window.open(
    authUrl,
    'google-login',
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`,
  );

  if (!popup) {
    cleanup();
    onError('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
    return;
  }

  // ✅ 빠른 폴링 시작 (500ms마다, 30초간)
  fastPollInterval = setInterval(fastPollForMessage, 500);

  // ✅ 느린 폴링 시작 (3초마다, 30초 후부터)
  setTimeout(() => {
    if (!messageProcessed) {
      pollInterval = setInterval(slowPollForMessage, 3000);
    }
  }, 30000);

  // ✅ 최종 타임아웃 (15분)
  timeoutHandle = setTimeout(
    () => {
      if (!messageProcessed) {
        cleanup();

        try {
          if (popup && typeof popup.close === 'function') {
            popup.close();
          }
        } catch (e: any) {}

        onError('로그인 시간이 초과되었습니다. 다시 시도해주세요.');
      }
    },
    15 * 60 * 1000,
  ); // 15분
};

/**
 * 구글 로그인 콜백 처리 (GoogleCallback 페이지에서 사용)
 */
export const handleGoogleOAuthCallback = () => {
  const { code, error, state } = extractOAuthParams();
  const userType = extractUserTypeFromState(state);

  let message;

  if (error) {
    message = {
      type: 'GOOGLE_AUTH_ERROR',
      error: `OAuth 인증 실패: ${error}`,
      timestamp: Date.now(),
    };
  } else if (!code) {
    message = {
      type: 'GOOGLE_AUTH_ERROR',
      error: '인증 코드를 받지 못했습니다.',
      timestamp: Date.now(),
    };
  } else if (!userType) {
    message = {
      type: 'GOOGLE_AUTH_ERROR',
      error: '사용자 타입 정보가 없습니다.',
      timestamp: Date.now(),
    };
  } else {
    message = {
      type: 'GOOGLE_AUTH_SUCCESS',
      code,
      userType,
      timestamp: Date.now(),
    };
  }

  // ✅ 메시지를 localStorage에 저장 (여러 번 시도)
  const saveMessage = (attempt: number = 1) => {
    try {
      const messageStr = JSON.stringify(message);
      localStorage.setItem(OAUTH_MESSAGE_KEY, messageStr);

      // 상태 업데이트
      const currentStatus = localStorage.getItem(OAUTH_STATUS_KEY);
      if (currentStatus) {
        const statusData = JSON.parse(currentStatus);
        statusData.status = 'completed';
        statusData.endTime = Date.now();
        localStorage.setItem(OAUTH_STATUS_KEY, JSON.stringify(statusData));
      }
    } catch (saveError: any) {
      console.error(`❌ 메시지 저장 실패 (${attempt}번째 시도):`, saveError);

      // 재시도 (최대 3번)
      if (attempt < 3) {
        setTimeout(() => saveMessage(attempt + 1), 100);
      }
    }
  };

  // 메시지 저장
  saveMessage();

  // ✅ 팝업 닫기 (여러 번 시도)
  const closePopup = (attempt: number = 1) => {
    try {
      if (typeof window.close === 'function') {
        window.close();
      }
    } catch (closeError: any) {
      // 재시도 (최대 3번)
      if (attempt < 3) {
        setTimeout(() => closePopup(attempt + 1), 200);
      }
    }
  };

  // 지연 후 팝업 닫기 시도
  setTimeout(() => closePopup(), 300);
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

/**
 * OAuth 상태 조회 (디버깅용)
 */
export const getOAuthStatus = () => {
  const message = localStorage.getItem(OAUTH_MESSAGE_KEY);
  const status = localStorage.getItem(OAUTH_STATUS_KEY);

  return {
    message: message ? JSON.parse(message) : null,
    status: status ? JSON.parse(status) : null,
  };
};

/**
 * OAuth 통계 조회 (디버깅용)
 */
export const getOAuthStats = () => {
  const status = localStorage.getItem(OAUTH_STATUS_KEY);

  if (!status) {
    return { active: false };
  }

  try {
    const statusData = JSON.parse(status);
    const now = Date.now();
    const elapsed = now - statusData.startTime;

    return {
      active: true,
      sessionId: statusData.sessionId,
      status: statusData.status,
      elapsedSeconds: Math.floor(elapsed / 1000),
      startTime: new Date(statusData.startTime).toLocaleTimeString(),
      endTime: statusData.endTime
        ? new Date(statusData.endTime).toLocaleTimeString()
        : null,
    };
  } catch (error) {
    return { active: false, error: 'Status parse error' };
  }
};
