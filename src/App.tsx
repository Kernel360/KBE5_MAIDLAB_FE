import React from 'react';
import { AuthProvider, ThemeProvider, ToastProvider } from '@/hooks';
import { ToastContainer } from '@/components/common';
import { AppRoutes } from '@/routes';
import { Analytics } from '@vercel/analytics/react'; // next가 아니라 react로 import
import '@/styles/index.css';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <div className="App">
            <AppRoutes />
            <ToastContainer />
            <Analytics />
          </div>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
