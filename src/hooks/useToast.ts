import React, { createContext, useContext, useState, useCallback } from 'react';
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

  const showToast = useCallback(
    (
      message: string,
      type: Toast['type'] = 'info',
      duration: number = 3000,
    ) => {
      const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const toast: Toast = { id, message, type, duration };

      console.log('🍞 토스트 추가:', toast); // 디버깅 로그

      setToasts((prev) => [...prev, toast]);

      // 자동 제거
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);

      return id;
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    console.log('🗑️ 토스트 제거:', id); // 디버깅 로그
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    console.log('🧹 모든 토스트 제거'); // 디버깅 로그
    setToasts([]);
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
