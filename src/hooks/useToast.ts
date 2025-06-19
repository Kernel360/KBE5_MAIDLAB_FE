import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react';
import type { ReactNode } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (
    message: string,
    type?: Toast['type'],
    duration?: number,
  ) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const recentToastsRef = useRef<Map<string, number>>(new Map());

  const showToast = useCallback(
    (
      message: string,
      type: Toast['type'] = 'info',
      duration: number = 3000,
    ) => {
      const now = Date.now();
      const toastKey = `${message}_${type}`;

      const hasActiveToast = toasts.some(
        (toast) => toast.message === message && toast.type === type,
      );

      const lastShownTime = recentToastsRef.current.get(toastKey);
      const isRecentlyShown = lastShownTime && now - lastShownTime < 5000; // 5초

      if (hasActiveToast || isRecentlyShown) {
        return ''; // 중복 방지
      }

      // 토스트 표시 시간 기록
      recentToastsRef.current.set(toastKey, now);

      const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const toast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, toast]);

      // 자동 제거
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));

        // 토스트 제거 후 일정 시간이 지나면 최근 기록도 정리
        setTimeout(() => {
          const currentTime = Date.now();
          const entries = Array.from(recentToastsRef.current.entries());
          entries.forEach(([key, time]) => {
            if (currentTime - time > 10000) {
              // 10초 후 기록 제거
              recentToastsRef.current.delete(key);
            }
          });
        }, 2000);
      }, duration);

      return id;
    },
    [toasts],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
    recentToastsRef.current.clear(); // 최근 기록도 초기화
  }, []);

  const value: ToastContextType = {
    toasts,
    showToast,
    removeToast,
    clearToasts,
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
