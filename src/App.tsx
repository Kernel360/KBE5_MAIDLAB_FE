import React, { useEffect } from 'react';
import { AppRoutes } from '@/routes';
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
    <div className="w-full h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <AppRoutes />
    </div>
  );
};

export default App;
