import React from 'react';
import { AuthProvider, ThemeProvider, ToastProvider } from '@/hooks';
import { ToastContainer } from '@/components/common';
import { AppRoutes } from '@/routes';
import { Analytics } from '@vercel/analytics/react';
import '@/styles/index.css';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <div className="App min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
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
