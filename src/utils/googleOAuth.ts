import { env } from '@/config/env';
import { DEFAULT_POPUP_CONFIG } from '@/constants/auth';
import {
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
} from './storage';
import type { PopupConfig } from '@/types/domain/auth';

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
  sessionId: string,
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
    state: `userType=${userType}&sessionId=${sessionId}&timestamp=${Date.now()}`,
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
 * state 파라미터에서 sessionId 추출
 */
export const extractSessionIdFromState = (
  state: string | null,
): string | null => {
  if (!state) return null;
  const match = state.match(/sessionId=([^&]+)/);
  return match ? match[1] : null;
};

/**
 * 구글 로그인 팝업 열기
 */
export const openGoogleLoginPopup = (
  userType: 'CONSUMER' | 'MANAGER',
  onSuccess: (code: string, userType: 'CONSUMER' | 'MANAGER') => void,
  onError: (error: string) => void,
  config: Partial<PopupConfig> = {},
): void => {
  const popupConfig = { ...DEFAULT_POPUP_CONFIG, ...config };
  const sessionId = `oauth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const authUrl = generateGoogleOAuthUrl(userType, sessionId);

  const popupManager = new GoogleOAuthPopupManager(
    sessionId,
    popupConfig,
    onSuccess,
    onError,
  );

  popupManager.openPopup(authUrl);
};

/**
 * Google OAuth 팝업 관리 클래스
 */
class GoogleOAuthPopupManager {
  private messageProcessed = false;
  private pollInterval?: NodeJS.Timeout;
  private fastPollInterval?: NodeJS.Timeout;
  private timeoutHandle?: NodeJS.Timeout;
  private popup: Window | null = null;
  private fastPollCount = 0;

  constructor(
    private sessionId: string,
    private config: PopupConfig,
    private onSuccess: (code: string, userType: 'CONSUMER' | 'MANAGER') => void,
    private onError: (error: string) => void,
  ) {
    this.setupEventListeners();
  }

  openPopup(authUrl: string): void {
    this.prepareOAuthSession();

    // 페이지 로드 시 해시 확인
    this.checkHashOnLoad();

    this.popup = this.createPopupWindow(authUrl);

    if (!this.popup) {
      this.cleanup();
      this.onError('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
      return;
    }

    this.startPolling();
    this.setupTimeout();
  }

  private createPopupWindow(authUrl: string): Window | null {
    const { width, height } = this.config;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    return window.open(
      authUrl,
      'google-login',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`,
    );
  }

  private prepareOAuthSession(): void {
    removeLocalStorage(OAUTH_MESSAGE_KEY);
    removeLocalStorage(OAUTH_STATUS_KEY);
    setLocalStorage(OAUTH_STATUS_KEY, {
      status: 'pending',
      sessionId: this.sessionId,
      startTime: Date.now(),
    });
  }

  private setupEventListeners(): void {
    window.addEventListener('storage', this.handleStorageChange.bind(this));
    window.addEventListener('message', this.handleMessage.bind(this));
    window.addEventListener('hashchange', this.handleHashChange.bind(this));
    window.addEventListener('beforeunload', this.cleanup.bind(this));
  }

  private handleStorageChange(e: StorageEvent): void {
    if (this.messageProcessed || e.key !== OAUTH_MESSAGE_KEY || !e.newValue) {
      return;
    }

    try {
      const data = JSON.parse(e.newValue);
      if (this.isValidSession()) {
        this.processMessage(data);
      }
    } catch (error) {
      console.error('❌ localStorage 이벤트 파싱 에러:', error);
    }
  }

  private handleMessage(e: MessageEvent): void {
    if (this.messageProcessed || e.data.type !== 'GOOGLE_OAUTH_RESULT') {
      return;
    }

    console.log('📨 postMessage 받음:', e.data);
    this.processMessage(e.data.data);
  }

  private handleHashChange(): void {
    this.checkHashOnLoad();
  }

  private checkHashOnLoad(): void {
    if (this.messageProcessed) {
      return;
    }

    const hash = window.location.hash;

    if (hash.startsWith('#oauth-result=')) {
      try {
        const resultData = hash.substring('#oauth-result='.length);
        const message = JSON.parse(atob(resultData));
        this.processMessage(message);

        // 해시 제거
        window.location.hash = '';
      } catch (error) {
        console.error('❌ URL 해시 파싱 에러:', error);
      }
    }
  }

  private isValidSession(): boolean {
    const status = getLocalStorage(OAUTH_STATUS_KEY);
    if (!status) return false;

    try {
      const statusData = status as { sessionId: string };
      return statusData.sessionId === this.sessionId;
    } catch {
      return false;
    }
  }

  private startPolling(): void {
    // 빠른 폴링 시작
    this.fastPollInterval = setInterval(
      this.fastPollForMessage.bind(this),
      this.config.fastPollInterval,
    );

    // 느린 폴링 시작 (빠른 폴링 종료 후)
    setTimeout(() => {
      if (!this.messageProcessed) {
        this.pollInterval = setInterval(
          this.slowPollForMessage.bind(this),
          this.config.slowPollInterval,
        );
      }
    }, this.config.fastPollDuration);
  }

  private fastPollForMessage(): void {
    if (this.messageProcessed) return;

    this.fastPollCount++;
    this.checkForMessage();

    // 빠른 폴링 종료 조건
    if (
      this.fastPollCount >=
      this.config.fastPollDuration / this.config.fastPollInterval
    ) {
      if (this.fastPollInterval) {
        clearInterval(this.fastPollInterval);
      }
    }
  }

  private slowPollForMessage(): void {
    if (this.messageProcessed) return;
    this.checkForMessage();
  }

  private checkForMessage(): void {
    try {
      const message = getLocalStorage(OAUTH_MESSAGE_KEY);
      const directMessage = localStorage.getItem(OAUTH_MESSAGE_KEY);

      console.log('🔍 폴링 중 메시지 체크:', {
        hasMessage: !!message,
        sessionId: this.sessionId,
        isValidSession: this.isValidSession(),
        message: message,
        directMessage: directMessage,
      });

      if (message && this.isValidSession()) {
        const data = message;
        this.processMessage(data);
      } else if (directMessage) {
        // 직접 localStorage에서 가져온 메시지 처리 (sessionId 체크 제거)
        try {
          const parsedMessage = JSON.parse(directMessage);
          if (parsedMessage.value) {
            console.log(parsedMessage.value);
            this.processMessage(parsedMessage.value);
          }
        } catch (parseError) {
          console.error('❌ 직접 메시지 파싱 에러:', parseError);
        }
      }
    } catch (error) {
      console.error('❌ 메시지 체크 에러:', error);
    }
  }

  private processMessage(messageData: any): void {
    if (this.messageProcessed) return;

    // messageData가 없거나 잘못된 경우 처리 중단
    if (!messageData || typeof messageData !== 'object') {
      console.log('❌ 잘못된 메시지 데이터:', messageData);
      return;
    }

    this.cleanup();
    this.closePopup();

    // 콜백 실행
    if (messageData.type === 'GOOGLE_AUTH_SUCCESS') {
      this.onSuccess(messageData.code, messageData.userType);
    } else {
      this.onError(messageData.error || 'OAuth 인증에 실패했습니다.');
    }
  }

  private closePopup(): void {
    setTimeout(() => {
      try {
        if (this.popup && typeof this.popup.close === 'function') {
          setTimeout(() => {
            try {
              this.popup?.close();
            } catch (e) {
              // COOP 에러 무시
            }
          }, 100);
        }
      } catch (e) {
        // 팝업 닫기 실패 무시
      }
    }, 200);
  }

  private setupTimeout(): void {
    // 타임아웃을 30초로 늘려서 sessionStorage 처리 시간 확보
    const extendedTimeout = 30000;
    console.log(
      '⏰ 타임아웃 설정:',
      extendedTimeout + 'ms (sessionStorage 처리용)',
    );
    this.timeoutHandle = setTimeout(() => {
      if (!this.messageProcessed) {
        console.log('❌ 타임아웃 발생 - sessionStorage 처리가 완료되지 않음');
        this.cleanup();
        this.closePopup();
      }
    }, extendedTimeout);
  }

  private cleanup(): void {
    if (this.messageProcessed) return;

    this.messageProcessed = true;

    // 타이머들 정리
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.fastPollInterval) clearInterval(this.fastPollInterval);
    if (this.timeoutHandle) clearTimeout(this.timeoutHandle);

    // 이벤트 리스너 제거
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
    window.removeEventListener('message', this.handleMessage.bind(this));
    window.removeEventListener('hashchange', this.handleHashChange.bind(this));
    window.removeEventListener('beforeunload', this.cleanup.bind(this));

    // localStorage 정리
    removeLocalStorage(OAUTH_MESSAGE_KEY);
    removeLocalStorage(OAUTH_STATUS_KEY);
  }
}

/**
 * 구글 로그인 콜백 처리 (GoogleCallback 페이지에서 사용)
 */
export const handleGoogleOAuthCallback = () => {
  const { code, error, state } = extractOAuthParams();
  const userType = extractUserTypeFromState(state);
  const sessionId = extractSessionIdFromState(state);

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
  } else if (!sessionId) {
    message = {
      type: 'GOOGLE_AUTH_ERROR',
      error: '세션 ID 정보가 없습니다.',
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
      setLocalStorage(OAUTH_MESSAGE_KEY, message);

      // 상태 업데이트 - sessionId가 있을 때만
      if (sessionId) {
        const currentStatus = getLocalStorage(OAUTH_STATUS_KEY);
        if (currentStatus) {
          const statusData = currentStatus as {
            status: string;
            sessionId: string;
            endTime: number;
          };
          // sessionId가 일치하는 경우에만 업데이트
          if (statusData.sessionId === sessionId) {
            statusData.status = 'completed';
            statusData.endTime = Date.now();
            setLocalStorage(OAUTH_STATUS_KEY, statusData);
          }
        }
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

  // 부모 창에 메시지 전달 시도
  setTimeout(() => {
    try {
      // 1. postMessage 시도
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(
          {
            type: 'GOOGLE_OAUTH_RESULT',
            data: message,
          },
          window.location.origin,
        );
        console.log('📨 부모 창에 postMessage 전송:', message);
      }

      // 2. URL 기반 메시지 전달 시도
      if (window.opener && !window.opener.closed) {
        const resultData = btoa(JSON.stringify(message));
        const callbackUrl = `${window.location.origin}/#oauth-result=${resultData}`;
        window.opener.location.href = callbackUrl;
        console.log('📨 부모 창 URL 변경:', callbackUrl);
      }
    } catch (error) {
      console.log('❌ 부모 창 메시지 전송 실패:', error);
    }
  }, 100);

  // ✅ 팝업 닫기 (여러 번 시도)
  const closePopup = (attempt: number = 1) => {
    try {
      if (typeof window.close === 'function') {
        setTimeout(() => {
          try {
            window.close();
          } catch (e) {
            // COOP 에러 무시
          }
        }, 100);
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
  removeLocalStorage(OAUTH_MESSAGE_KEY);
  removeLocalStorage(OAUTH_STATUS_KEY);
};

/**
 * OAuth 상태 조회 (디버깅용)
 */
export const getOAuthStatus = () => {
  const message = getLocalStorage(OAUTH_MESSAGE_KEY);
  const status = getLocalStorage(OAUTH_STATUS_KEY);

  return {
    message: message,
    status: status,
  };
};

/**
 * OAuth 통계 조회 (디버깅용)
 */
export const getOAuthStats = () => {
  const status = getLocalStorage(OAUTH_STATUS_KEY);

  if (!status) {
    return { active: false };
  }

  try {
    const statusData = status as {
      sessionId: string;
      startTime: number;
      status: string;
      endTime?: number;
    };
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
