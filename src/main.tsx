import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';
import { injectSpeedInsights } from '@vercel/speed-insights';

const isDev = import.meta.env.DEV;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

const AppWithProviders = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

injectSpeedInsights();

if (isDev) {
  root.render(
    <React.StrictMode>
      <AppWithProviders />
    </React.StrictMode>,
  );
} else {
  root.render(<AppWithProviders />);
}
