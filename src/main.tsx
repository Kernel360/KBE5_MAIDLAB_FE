import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ScrollToTop } from './components/common';
import { DesktopViewport } from './components/layout';
import { AuthProvider, ThemeProvider, ToastProvider } from '@/hooks';
import { ToastContainer } from '@/components/common';
import { Analytics } from '@vercel/analytics/react';
import './styles/index.css';
import './styles/mobile-frame.css';
import { injectSpeedInsights } from '@vercel/speed-insights';

const isDev = import.meta.env.DEV;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

const SimpleViewportResize = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <ScrollToTop />
            <DesktopViewport>
              <App />
            </DesktopViewport>
            
            {/* 토스트 컨테이너 - 최상위에서 관리 */}
            <div style={{ position: 'fixed', zIndex: 10000 }}>
              <ToastContainer />
            </div>
            <Analytics />
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
};

// 사용할 컴포넌트
const AppToRender = SimpleViewportResize;

injectSpeedInsights();

if (isDev) {
  root.render(
    <React.StrictMode>
      <AppToRender />
    </React.StrictMode>,
  );
} else {
  root.render(<AppToRender />);
}
