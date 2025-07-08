import React, { useEffect } from 'react';
import { AuthProvider, ThemeProvider, ToastProvider } from '@/hooks';
import { ToastContainer } from '@/components/common';
import { AppRoutes } from '@/routes';
import { Analytics } from '@vercel/analytics/react';
import '@/styles/index.css';

const App: React.FC = () => {
  // 초기 테마 설정
  useEffect(() => {
    // localStorage에 테마가 없으면 light로 초기화
    if (!localStorage.getItem('theme')) {
      localStorage.setItem('theme', 'light');
    }
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          {/* 모바일 컨테이너 최적화된 레이아웃 */}
          <div className="w-full h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
            <AppRoutes />
          </div>

          {/* 토스트 컨테이너 - 모바일 컨테이너 내에서 작동 */}
          <div style={{ position: 'relative', zIndex: 100 }}>
            <ToastContainer />
          </div>
          <Analytics />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
