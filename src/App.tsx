import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, ThemeProvider } from '@/hooks';
import { ToastContainer } from '@/components/common';
import { ROUTES } from '@/constants';

// Pages
import {
  Home,
  Login,
  SignUp,
  NotFound,
  GoogleCallBack,
  SocialSignUp,
} from '@/pages';

// Styles
import '@/styles/index.css';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* 공통 페이지 */}
            <Route path={ROUTES.HOME} element={<Home />} />
            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route path={ROUTES.SIGNUP} element={<SignUp />} />
            <Route path={ROUTES.SOCIAL_SIGNUP} element={<SocialSignUp />} />
            <Route path="/google-callback" element={<GoogleCallBack />} />

            {/* 이벤트 페이지 (나중에 구현) */}
            {/* <Route path={ROUTES.EVENTS} element={<Events />} />
              <Route path={ROUTES.EVENT_DETAIL} element={<EventDetail />} /> */}

            {/* 게시판 페이지 (나중에 구현) */}
            {/* <Route path={ROUTES.BOARD} element={<Board />} />
              <Route path={ROUTES.BOARD_CREATE} element={<BoardCreate />} />
              <Route path={ROUTES.BOARD_DETAIL} element={<BoardDetail />} /> */}

            {/* 소비자 페이지 (나중에 구현) */}
            {/* <Route
                path={ROUTES.CONSUMER.MYPAGE}
                element={
                  <ProtectedRoute requiredUserType="CONSUMER">
                    <ConsumerMyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.CONSUMER.PROFILE}
                element={
                  <ProtectedRoute requiredUserType="CONSUMER">
                    <ConsumerProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.CONSUMER.RESERVATIONS}
                element={
                  <ProtectedRoute requiredUserType="CONSUMER">
                    <ConsumerReservations />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.CONSUMER.RESERVATION_CREATE}
                element={
                  <ProtectedRoute requiredUserType="CONSUMER">
                    <ReservationCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.CONSUMER.LIKED_MANAGERS}
                element={
                  <ProtectedRoute requiredUserType="CONSUMER">
                    <LikedManagers />
                  </ProtectedRoute>
                }
              /> */}

            {/* 매니저 페이지 (나중에 구현) */}
            {/* <Route
                path={ROUTES.MANAGER.MYPAGE}
                element={
                  <ProtectedRoute requiredUserType="MANAGER">
                    <ManagerMyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.MANAGER.PROFILE}
                element={
                  <ProtectedRoute requiredUserType="MANAGER">
                    <ManagerProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.MANAGER.PROFILE_CREATE}
                element={
                  <ProtectedRoute requiredUserType="MANAGER">
                    <ManagerProfileCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.MANAGER.RESERVATIONS}
                element={
                  <ProtectedRoute requiredUserType="MANAGER">
                    <ManagerReservations />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.MANAGER.REVIEWS}
                element={
                  <ProtectedRoute requiredUserType="MANAGER">
                    <ManagerReviews />
                  </ProtectedRoute>
                }
              /> */}

            {/* 관리자 페이지 (나중에 구현) */}
            {/* <Route
                path={ROUTES.ADMIN.DASHBOARD}
                element={
                  <ProtectedRoute requiredUserType="ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN.LOGIN}
                element={<AdminLogin />}
              />
              <Route
                path={ROUTES.ADMIN.MANAGERS}
                element={
                  <ProtectedRoute requiredUserType="ADMIN">
                    <AdminManagers />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN.CONSUMERS}
                element={
                  <ProtectedRoute requiredUserType="ADMIN">
                    <AdminConsumers />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN.RESERVATIONS}
                element={
                  <ProtectedRoute requiredUserType="ADMIN">
                    <AdminReservations />
                  </ProtectedRoute>
                }
              /> */}

            {/* 404 페이지 */}
            <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* 전역 토스트 컨테이너 */}
          <ToastContainer />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
