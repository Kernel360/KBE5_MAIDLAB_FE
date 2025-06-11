import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, ThemeProvider } from '@/hooks';
import { ProtectedRoute, ToastContainer } from '@/components/common';
import { ROUTES } from '@/constants';

// Pages - 개별 import로 변경
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import NotFound from '@/pages/NotFound';
import GoogleCallback from '@/pages/GoogleCallback';
import SocialSignUp from '@/pages/SocialSignUp';
  

import {
  AdminLogin,
  AdminLayout,
  AdminUserList,
  AdminManagerDetail,
  AdminConsumerDetail,
  AdminReservationList,
  AdminReservationDetail,
  AdminEvents,
  AdminEventCreate,
  AdminBoards,
  AdminBoardDetail,
  AdminBoardEdit,
  AdminEventEdit,
  AdminEventDetail,
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
            <Route path="/google-callback" element={<GoogleCallback />} />

            {/* 이벤트 페이지 (나중에 구현) */}
            {/* <Route path={ROUTES.EVENTS} element={<Events />} />
              <Route path={ROUTES.EVENT_DETAIL} element={<EventDetail />} />

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

          {/* 매니저 라우트들 */}
          {/* <Route
            path={ROUTES.MANAGER.MYPAGE}
            element={
              <ProtectedRoute requiredUserType="MANAGER">
                <ManagerMyPage />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.MANAGER.PROFILE}
            element={
              <ProtectedRoute requiredUserType="MANAGER">
                <ManagerProfile />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.MANAGER.PROFILE_EDIT}
            element={
              <ProtectedRoute requiredUserType="MANAGER">
                <ManagerProfile />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.MANAGER.PROFILE_CREATE}
            element={
              <ProtectedRoute requiredUserType="MANAGER">
                <ManagerProfileCreate />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.MANAGER.RESERVATIONS}
            element={
              <ProtectedRoute requiredUserType="MANAGER">
                <ManagerReservations />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.MANAGER.RESERVATION_DETAIL}
            element={
              <ProtectedRoute requiredUserType="MANAGER">
                <ManagerReservationDetail />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.MANAGER.REVIEWS}
            element={
              <ProtectedRoute requiredUserType="MANAGER">
                <ManagerReviews />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.MANAGER.MATCHING}
            element={
              <ProtectedRoute requiredUserType="MANAGER">
                <ManagerMatching />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.MANAGER.SETTLEMENTS}
            element={
              <ProtectedRoute requiredUserType="MANAGER">
                <ManagerSettlements />
              </ProtectedRoute>
            }
          /> */}

          {/* 관리자 라우트 */}
          <Route key="admin-login" path={ROUTES.ADMIN.LOGIN} element={<AdminLogin />} />,

          // 관리자 대시보드 및 하위 페이지들
          <Route
            key="admin-dashboard"
            path={ROUTES.ADMIN.DASHBOARD}
            element={
              <ProtectedRoute requiredUserType="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* 회원 관리 */}
            <Route path="users" element={<AdminUserList />} />
            <Route path="users/manager/:id" element={<AdminManagerDetail />} />
            <Route path="users/consumer/:id" element={<AdminConsumerDetail />} />

            {/* 예약 관리 */}
            <Route path="reservations" element={<AdminReservationList />} />
            <Route path="reservations/:id" element={<AdminReservationDetail />} />

            {/* 이벤트 관리 */}
            <Route path="events" element={<AdminEvents />} />
            <Route path="events/create" element={<AdminEventCreate />} />
            <Route path="events/:id/edit" element={<AdminEventEdit />} />
            <Route path="events/:id" element={<AdminEventDetail />} />

            {/* 게시판 관리 */}
            <Route path="boards" element={<AdminBoards />} />
            <Route path="boards/:id" element={<AdminBoardDetail />} />
            <Route path="boards/:id/edit" element={<AdminBoardEdit />} />

            {/* 기본 리다이렉트 */}
            <Route index element={<AdminUserList />} />
          </Route>

          {/* 공통 게시판 라우트들 */}
          {/* <Route
            path={ROUTES.BOARD}
            element={
              <ProtectedRoute>
                <BoardPage />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.BOARD_CREATE}
            element={
              <ProtectedRoute>
                <BoardCreatePage />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.BOARD_DETAIL}
            element={
              <ProtectedRoute>
                <BoardDetailPage />
              </ProtectedRoute>
            }
          /> */}

            {/* 404 페이지 */}
            {/* <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
            <Route path="*" element={<NotFound />} /> */}
          </Routes>

          {/* 전역 토스트 컨테이너 */}
          <ToastContainer />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
};


export default App;
