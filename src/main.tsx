import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router-dom';
import App from './App';
import { ScrollToTop } from './components/common';
import { AuthProvider, ThemeProvider, ToastProvider } from '@/hooks';
import { ToastContainer } from '@/components/common';
import { Analytics } from '@vercel/analytics/react';
import './styles/index.css';
import './styles/mobile-frame.css';
import { injectSpeedInsights } from '@vercel/speed-insights';

const isDev = import.meta.env.DEV;

// React root를 한 번만 생성하도록 보장
const rootElement = document.getElementById('root') as HTMLElement & {
  _reactRoot?: ReactDOM.Root;
};
let root: ReactDOM.Root;

if (!rootElement._reactRoot) {
  root = ReactDOM.createRoot(rootElement);
  rootElement._reactRoot = root;
} else {
  root = rootElement._reactRoot;
}

// 조건부 레이아웃 컴포넌트
const ConditionalLayout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    // Admin 페이지는 전체 화면으로 렌더링
    return (
      <>
        <ScrollToTop />
        <App />

        {/* 토스트 컨테이너 - Admin에서도 표시 */}
        <div style={{ position: 'fixed', zIndex: 10000 }}>
          <ToastContainer />
        </div>
        <Analytics />
      </>
    );
  }

  // 일반 페이지는 전체 화면으로 렌더링
  return (
    <>
      <ScrollToTop />
      <div className="w-screen h-screen bg-white dark:bg-gray-900 overflow-y-auto overflow-x-hidden main-container">
        <App />
      </div>

      {/* 토스트 컨테이너 - 최상위에서 관리 */}
      <div style={{ position: 'fixed', zIndex: 10000 }}>
        <ToastContainer />
      </div>
      <Analytics />
    </>
  );
};

const SimpleViewportResize = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <ConditionalLayout />
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
};

// 사용할 컴포넌트
const AppToRender = SimpleViewportResize;

injectSpeedInsights();

// OAuth 해시 결과 처리
const handleOAuthHashResult = () => {
  const hash = window.location.hash;
  if (hash.startsWith('#oauth-result=')) {
    try {
      const resultData = hash.substring('#oauth-result='.length);
      const message = JSON.parse(atob(resultData));
      console.log('📨 전역에서 URL 해시 OAuth 결과 받음:', message);
      
      // 해시 제거
      window.location.hash = '';
      
      // sessionStorage에 OAuth 결과 저장
      sessionStorage.setItem('google_oauth_result', JSON.stringify(message));
      
      // 로그인 페이지로 리다이렉트
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('❌ 전역 OAuth 해시 파싱 에러:', error);
    }
  }
};

// 앱 시작 시 해시 확인
handleOAuthHashResult();

if (isDev) {
  root.render(
    <React.StrictMode>
      <AppToRender />
    </React.StrictMode>,
  );
} else {
  root.render(<AppToRender />);
}
