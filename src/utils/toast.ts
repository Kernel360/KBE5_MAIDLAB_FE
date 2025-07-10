import type {
  Toast,
  ToastType,
  PromiseToastMessages,
} from '@/types/hooks/toast';
import { generateId } from '@/utils/data';

/**
 * 토스트 매니저 클래스 - 모든 비즈니스 로직 관리
 */
export class ToastManager {
  private recentToasts = new Map<string, number>();
  private timeouts = new Map<string, NodeJS.Timeout>();
  private cleanupInterval?: NodeJS.Timeout;
  private stats = { totalShown: 0, duplicatesBlocked: 0 };

  constructor(
    private config: {
      defaultDuration: number;
      maxToasts: number;
      duplicateThreshold: number;
    },
  ) {
    this.startCleanupInterval();
  }

  /**
   * 토스트 생성 및 검증
   */
  createToast(
    message: string,
    type: ToastType,
    duration?: number,
    currentToasts: Toast[] = [],
  ): { toast: Toast | null; shouldAdd: boolean } {
    if (!this.isValidMessage(message)) {
      console.warn('ToastManager: 유효하지 않은 메시지');
      return { toast: null, shouldAdd: false };
    }

    // 중복 검사
    if (this.isDuplicate(message, type, currentToasts)) {
      this.logDuplicateBlocked(message, type);
      return { toast: null, shouldAdd: false };
    }

    // 토스트 생성
    const toast: Toast = {
      id: generateId(12),
      message: message.trim(),
      type,
      duration: duration ?? this.config.defaultDuration,
    };

    // 최근 토스트 기록
    this.recordRecentToast(message, type);
    this.logToastCreated(toast);

    return { toast, shouldAdd: true };
  }

  /**
   * 토스트 목록 관리 (최대 개수 제한)
   */
  manageToastList(toasts: Toast[], newToast: Toast): Toast[] {
    const updatedToasts = [...toasts, newToast];

    if (updatedToasts.length > this.config.maxToasts) {
      // 오래된 토스트들의 타임아웃 정리
      const toastsToRemove = updatedToasts.slice(
        0,
        updatedToasts.length - this.config.maxToasts,
      );
      toastsToRemove.forEach((toast) => this.clearToastTimeout(toast.id));

      return updatedToasts.slice(-this.config.maxToasts);
    }

    return updatedToasts;
  }

  /**
   * 토스트 자동 제거 타임아웃 설정
   */
  scheduleToastRemoval(
    toastId: string,
    duration: number,
    onRemove: (id: string) => void,
  ): void {
    // duration이 0이면 수동 제거 (무한 지속)
    if (duration === 0) return;

    const timeoutId = setTimeout(() => {
      onRemove(toastId);
      this.timeouts.delete(toastId);
    }, duration);

    this.timeouts.set(toastId, timeoutId);
  }

  /**
   * 토스트 즉시 제거
   */
  removeToast(id: string): void {
    if (!id || typeof id !== 'string') {
      console.warn('ToastManager: 유효하지 않은 토스트 ID');
      return;
    }
    this.clearToastTimeout(id);
  }

  /**
   * Promise 기반 토스트 처리
   */
  async handlePromiseToast(
    promise: Promise<any>,
    messages: PromiseToastMessages,
    onShowToast: (
      message: string,
      type: ToastType,
      duration?: number,
    ) => string | null,
    onRemoveToast: (id: string) => void,
  ): Promise<string | null> {
    // 로딩 토스트 표시 (무한 지속)
    const loadingId = onShowToast(messages.loading, 'info', 0);

    try {
      await promise;

      if (loadingId) onRemoveToast(loadingId);
      return onShowToast(messages.success, 'success');
    } catch (error) {
      if (loadingId) onRemoveToast(loadingId);
      return onShowToast(messages.error, 'error');
    }
  }

  /**
   * 모든 토스트 정리
   */
  clearAll(): void {
    this.clearAllTimeouts();
    this.recentToasts.clear();
    this.resetStats();
  }

  /**
   * 정리 작업 (메모리 해제)
   */
  destroy(): void {
    this.clearAll();
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  /**
   * 설정 업데이트
   */
  updateConfig(
    newConfig: Partial<{
      defaultDuration: number;
      maxToasts: number;
      duplicateThreshold: number;
    }>,
  ): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 개발 모드 통계
   */
  getStats() {
    return {
      ...this.stats,
      recentCacheSize: this.recentToasts.size,
      activeTimeouts: this.timeouts.size,
      config: { ...this.config },
    };
  }

  /**
   * 활성 토스트 개수
   */
  getActiveCount(): number {
    return this.timeouts.size;
  }

  /**
   * 특정 타입의 토스트 개수
   */
  getTypeCount(toasts: Toast[], type: ToastType): number {
    return toasts.filter((toast) => toast.type === type).length;
  }

  // ===== Private Methods =====

  private isValidMessage(message: string): boolean {
    return !!(message && typeof message === 'string' && message.trim());
  }

  private isDuplicate(
    message: string,
    type: ToastType,
    currentToasts: Toast[],
  ): boolean {
    // 현재 활성 토스트 중복 체크
    const hasActiveToast = currentToasts.some(
      (toast) => toast.message === message && toast.type === type,
    );

    // 최근 토스트 중복 체크
    const toastKey = this.generateToastKey(message, type);
    const lastShownTime = this.recentToasts.get(toastKey);
    const isRecentlyShown =
      lastShownTime &&
      Date.now() - lastShownTime < this.config.duplicateThreshold;

    return hasActiveToast || !!isRecentlyShown;
  }

  private recordRecentToast(message: string, type: ToastType): void {
    const toastKey = this.generateToastKey(message, type);
    this.recentToasts.set(toastKey, Date.now());
    this.stats.totalShown++;
  }

  private generateToastKey(message: string, type: string): string {
    return `${message}_${type}`;
  }

  private clearToastTimeout(id: string): void {
    const timeoutId = this.timeouts.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(id);
    }
  }

  private clearAllTimeouts(): void {
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts.clear();
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, 5000);
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    // 만료된 키 찾기 (10초 후 만료)
    this.recentToasts.forEach((time, key) => {
      if (now - time > 10000) {
        expiredKeys.push(key);
      }
    });

    // 만료된 키 제거
    expiredKeys.forEach((key) => this.recentToasts.delete(key));

    // 최대 크기 제한 (100개 초과시 절반 제거)
    if (this.recentToasts.size > 100) {
      const entries = Array.from(this.recentToasts.entries());
      const sortedEntries = entries.sort(([, a], [, b]) => a - b);
      const keysToRemove = sortedEntries.slice(0, 50).map(([key]) => key);

      keysToRemove.forEach((key) => this.recentToasts.delete(key));
    }
  }

  private logToastCreated(toast: Toast): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Toast created:', toast);
      this.stats.totalShown++;
    }
  }

  private logDuplicateBlocked(message: string, type: ToastType): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Duplicate toast blocked:', { message, type });
      this.stats.duplicatesBlocked++;
    }
  }

  private resetStats(): void {
    this.stats = { totalShown: 0, duplicatesBlocked: 0 };
  }
}

// 중복 토스트 방지 함수
let lastToastMessage = '';
let lastToastTime = 0;
const TOAST_COOLDOWN = 1000; // 1초 쿨다운

export const showDuplicatePreventedToast = (
  message: string,
  type: 'success' | 'error' | 'info' | 'warning',
  duration?: number,
): void => {
  const currentTime = Date.now();
  const toastKey = `${message}_${type}`;

  // 같은 메시지를 쿨다운 시간 내에 호출한 경우 무시
  if (
    toastKey === lastToastMessage &&
    currentTime - lastToastTime < TOAST_COOLDOWN
  ) {
    return;
  }

  lastToastMessage = toastKey;
  lastToastTime = currentTime;

  // 전역 토스트 함수 호출
  if (typeof window !== 'undefined' && (window as any).showToast) {
    (window as any).showToast(message, type, duration);
  } else {
    console.warn('토스트 함수를 찾을 수 없습니다:', message);
  }
};

// API 에러 토스트 함수
export const showApiErrorToast = (message: string): void => {
  showDuplicatePreventedToast(message, 'error');
};
