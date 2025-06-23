import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import type {
  Toast,
  ToastType,
  ToastContextType,
  ToastProviderProps,
  PromiseToastMessages,
} from '@/types/hooks/toast';
import { createToastManager, ToastManager } from '@/utils/toast';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  defaultDuration = 3000,
  maxToasts = 5,
  duplicateThreshold = 5000,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const managerRef = useRef<ToastManager>();

  // 토스트 매니저 초기화
  useEffect(() => {
    managerRef.current = createToastManager({
      defaultDuration,
      maxToasts,
      duplicateThreshold,
    });

    return () => {
      managerRef.current?.destroy();
    };
  }, [defaultDuration, maxToasts, duplicateThreshold]);

  // 설정이 변경되면 매니저 설정도 업데이트
  useEffect(() => {
    if (managerRef.current) {
      managerRef.current.updateConfig({
        defaultDuration,
        maxToasts,
        duplicateThreshold,
      });
    }
  }, [defaultDuration, maxToasts, duplicateThreshold]);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = 'info',
      duration?: number,
    ): string | null => {
      if (!managerRef.current) {
        console.warn('ToastManager가 초기화되지 않았습니다.');
        return null;
      }

      const { toast, shouldAdd } = managerRef.current.createToast(
        message,
        type,
        duration,
        toasts,
      );

      if (!shouldAdd || !toast) {
        return null;
      }

      // 토스트 목록 업데이트
      setToasts((currentToasts) =>
        managerRef.current!.manageToastList(currentToasts, toast),
      );

      // 자동 제거 스케줄링
      managerRef.current.scheduleToastRemoval(
        toast.id,
        toast.duration!,
        (id) => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        },
      );

      return toast.id;
    },
    [toasts],
  );

  const removeToast = useCallback((id: string) => {
    if (!managerRef.current) {
      console.warn('ToastManager가 초기화되지 않았습니다.');
      return;
    }

    managerRef.current.removeToast(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    if (!managerRef.current) {
      console.warn('ToastManager가 초기화되지 않았습니다.');
      return;
    }

    managerRef.current.clearAll();
    setToasts([]);
  }, []);

  // 편의 메서드들
  const success = useCallback(
    (message: string, duration?: number) => {
      return showToast(message, 'success', duration);
    },
    [showToast],
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      return showToast(message, 'error', duration);
    },
    [showToast],
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      return showToast(message, 'warning', duration);
    },
    [showToast],
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      return showToast(message, 'info', duration);
    },
    [showToast],
  );

  // Promise 기반 토스트
  const showPromiseToast = useCallback(
    async (
      promise: Promise<any>,
      messages: PromiseToastMessages,
    ): Promise<string | null> => {
      if (!managerRef.current) {
        console.warn('ToastManager가 초기화되지 않았습니다.');
        return null;
      }

      return await managerRef.current.handlePromiseToast(
        promise,
        messages,
        showToast,
        removeToast,
      );
    },
    [showToast, removeToast],
  );

  // 토스트 개수 조회
  const getToastCount = useCallback(() => {
    return toasts.length;
  }, [toasts.length]);

  // 특정 타입의 토스트 개수 조회
  const getToastCountByType = useCallback(
    (type: ToastType) => {
      if (!managerRef.current) return 0;
      return managerRef.current.getTypeCount(toasts, type);
    },
    [toasts],
  );

  // 토스트 존재 여부 확인
  const hasToasts = useCallback(() => {
    return toasts.length > 0;
  }, [toasts.length]);

  // 특정 타입의 토스트 존재 여부 확인
  const hasToastOfType = useCallback(
    (type: ToastType) => {
      return toasts.some((toast) => toast.type === type);
    },
    [toasts],
  );

  // 개발 모드 디버깅 및 전역 함수 등록
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // 통계 조회 함수
      (window as any).__toastStats = () => {
        if (!managerRef.current) {
          console.log('ToastManager가 초기화되지 않았습니다.');
          return;
        }

        const stats = managerRef.current.getStats();
        console.table({
          ...stats,
          currentActive: toasts.length,
          toastsByType: {
            success: getToastCountByType('success'),
            error: getToastCountByType('error'),
            warning: getToastCountByType('warning'),
            info: getToastCountByType('info'),
          },
        });
      };

      // 모든 토스트 제거 함수
      (window as any).__clearAllToasts = () => {
        clearToasts();
        console.log('모든 토스트가 제거되었습니다.');
      };

      // 테스트 토스트 생성 함수
      (window as any).__testToast = (type: ToastType = 'info') => {
        const messages = {
          success: '테스트 성공 메시지',
          error: '테스트 에러 메시지',
          warning: '테스트 경고 메시지',
          info: '테스트 정보 메시지',
        };

        showToast(messages[type], type);
        console.log(`${type} 타입 테스트 토스트가 생성되었습니다.`);
      };
    }

    // cleanup
    return () => {
      if (process.env.NODE_ENV === 'development') {
        delete (window as any).__toastStats;
        delete (window as any).__clearAllToasts;
        delete (window as any).__testToast;
      }
    };
  }, [toasts.length, getToastCountByType, clearToasts, showToast]);

  const value: ToastContextType = {
    toasts,
    showToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
    showPromiseToast,
    // 추가 메서드들
    getToastCount,
    getToastCountByType,
    hasToasts,
    hasToastOfType,
  };

  return React.createElement(ToastContext.Provider, { value }, children);
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// 추가 편의 훅들

/**
 * 토스트 상태만 조회하는 가벼운 훅
 */
export const useToastState = () => {
  const { toasts } = useToast();

  return {
    toasts,
    count: toasts.length,
    hasToasts: toasts.length > 0,
    hasSuccess: toasts.some((t) => t.type === 'success'),
    hasError: toasts.some((t) => t.type === 'error'),
    hasWarning: toasts.some((t) => t.type === 'warning'),
    hasInfo: toasts.some((t) => t.type === 'info'),
  };
};

/**
 * 토스트 액션만 제공하는 훅 (상태 구독 없음)
 */
export const useToastActions = () => {
  const {
    showToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
    showPromiseToast,
  } = useToast();

  return {
    showToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
    showPromiseToast,
  };
};
