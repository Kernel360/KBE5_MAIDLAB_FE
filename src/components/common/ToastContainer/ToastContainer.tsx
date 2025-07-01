import React, { useEffect } from 'react';
import { useToast } from '@/hooks';

interface ToastItemProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({
  id,
  message,
  type,
  onClose,
}) => {
  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div
      className={`${bgColors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 mb-2 animate-slide-in`}
    >
      <span className="text-lg">{icons[type]}</span>
      <span className="flex-1">{message}</span>
      <button
        onClick={() => onClose(id)}
        className="text-white hover:text-gray-200 font-bold text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[9999] max-w-sm">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};
