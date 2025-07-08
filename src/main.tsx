import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ScrollToTop } from './components/common';
import { DesktopViewport } from './components/layout';
import './styles/index.css';
import './styles/mobile-frame.css';
import { injectSpeedInsights } from '@vercel/speed-insights';

const isDev = import.meta.env.DEV;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

const SimpleViewportResize = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <DesktopViewport>
        <App />
      </DesktopViewport>
    </BrowserRouter>
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
