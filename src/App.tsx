import React from 'react';
import { AuthProvider, ThemeProvider, ToastProvider } from '@/hooks';
import { ToastContainer } from '@/components/common';
import { AppRoutes } from '@/routes';
import '@/styles/index.css';
import {Status, Wrapper} from "@googlemaps/react-wrapper";
import GoogleMap from './pages/reservation/GoogleMap';
const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return <>로딩중...</>;
    case Status.FAILURE:
      return <>에러 발생</>;
    case Status.SUCCESS:
      return <GoogleMap />;
  }
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Wrapper apiKey={import.meta.env.VITE_GOOGLEMAP_API_KEY} render={render}>
            <div className="App">
              <AppRoutes />
              <ToastContainer />
            </div>
          </Wrapper>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;

