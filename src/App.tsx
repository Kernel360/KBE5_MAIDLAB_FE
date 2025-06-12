import React from 'react';
import { AuthProvider, ThemeProvider, ToastProvider } from '@/hooks';
import { ToastContainer } from '@/components/common';
import { AppRoutes } from '@/routes';
import '@/styles/index.css';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <div className="App">
            <AppRoutes />
            <ToastContainer />
          </div>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
