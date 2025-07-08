import type {
  TOAST_TYPES,
  TOAST_POSITIONS,
  TOAST_PROMISE_STATES,
} from '@/constants/toast';

/**
 * 토스트 메시지 타입
 */
export type ToastType = (typeof TOAST_TYPES)[keyof typeof TOAST_TYPES];

/**
 * 토스트 위치 타입
 */
export type ToastPosition =
  (typeof TOAST_POSITIONS)[keyof typeof TOAST_POSITIONS];

/**
 * Promise 상태 타입
 */
export type PromiseState =
  (typeof TOAST_PROMISE_STATES)[keyof typeof TOAST_PROMISE_STATES];

/**
 * 토스트 액션 버튼
 */
export interface ToastAction {
  label: string;
  onClick: () => void;
}

/**
 * 기본 토스트 인터페이스
 */
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  title?: string;
  action?: ToastAction;
  closable?: boolean;
  position?: ToastPosition;
  persistent?: boolean;
}

/**
 * Promise 기반 토스트 메시지
 */
export interface PromiseToastMessages {
  loading: string;
  success: string;
  error: string;
}

/**
 * Promise 토스트 확장 인터페이스
 */
export interface ToastWithPromise extends Toast {
  promise?: Promise<any>;
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * 토스트 컨텍스트 타입
 */
export interface ToastContextType {
  toasts: Toast[];
  showToast: (
    message: string,
    type?: ToastType,
    duration?: number,
  ) => string | null;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  // 편의 메서드들
  success: (message: string, duration?: number) => string | null;
  error: (message: string, duration?: number) => string | null;
  warning: (message: string, duration?: number) => string | null;
  info: (message: string, duration?: number) => string | null;
  // Promise 토스트
  showPromiseToast: (
    promise: Promise<any>,
    messages: PromiseToastMessages,
  ) => Promise<string | null>;
  // 추가 유틸리티 메서드들
  getToastCount: () => number;
  getToastCountByType: (type: ToastType) => number;
  hasToasts: () => boolean;
  hasToastOfType: (type: ToastType) => boolean;
}

/**
 * 토스트 프로바이더 설정
 */
export interface ToastProviderProps {
  children: React.ReactNode;
  defaultDuration?: number;
  maxToasts?: number;
  position?: ToastPosition;
  duplicateThreshold?: number;
}

/**
 * 토스트 설정 옵션
 */
export interface ToastOptions {
  duration?: number;
  title?: string;
  action?: ToastAction;
  closable?: boolean;
  position?: ToastPosition;
  persistent?: boolean;
}

/**
 * 토스트 통계 (디버깅용)
 */
export interface ToastStats {
  totalShown: number;
  duplicatesBlocked: number;
  currentActive: number;
  recentCacheSize: number;
}
