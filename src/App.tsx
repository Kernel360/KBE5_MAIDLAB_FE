import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ThemeProvider, ToastProvider, useAuth } from '@/hooks';
import { ROUTES } from '@/constants';
import { clearExpiredLocalStorage } from '@/utils';
import '@/styles/index.css';

// Pages
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import NotFound from '@/pages/NotFound';
import GoogleCallback from '@/pages/GoogleCallback';
import SocialSignUp from '@/pages/SocialSignUp';
import ManagerProfileSetup from '@/pages/ManagerProfileSetup';
import ConsumerProfileSetup from '@/pages/ConsumerProfileSetup';

// Reservation Pages
import ConsumerReservations from '@/pages/reservation/ConsumerReservations';
import ConsumerReservationCreate from '@/pages/reservation/ConsumerReservationCreate';
import ConsumerReservationDetail from '@/pages/reservation/ConsumerReservationDetail';
import ManagerReservations from '@/pages/reservation/ManagerReservations';
import ManagerReservationDetail from '@/pages/reservation/ManagerReservationDetail';

// Consumer Pages
import ConsumerMyPage from '@/pages/consumer/MyPage';
import ConsumerProfile from '@/pages/consumer/Profile';
import ManagerList from '@/pages/consumer/ManagerList';

// Manager Pages
import { ManagerMatching } from '@/pages/matching/ManagerMatching';

// Admin Pages
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

// Board Pages
import BoardList from '@/pages/board/BoardList';
import BoardCreate from '@/pages/board/BoardCreate';
import BoardDetail from '@/pages/board/BoardDetail';
import BoardEdit from '@/pages/board/BoardEdit';

// Loading Component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredUserType?: 'CONSUMER' | 'MANAGER' | 'ADMIN';
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredUserType,
  redirectTo = ROUTES.LOGIN,
}) => {
  const { isAuthenticated, userType, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredUserType && userType !== requiredUserType) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
};

// Main App Component
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <div className="App">
            <Routes>
              {/* Common Routes */}
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
              <Route
                path={ROUTES.CONSUMER.PROFILE_SETUP}
                element={
                  <ProtectedRoute requiredUserType="CONSUMER">
                    <ConsumerProfileSetup />
                  </ProtectedRoute>
                }
              />
              <Route
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
                    <ConsumerReservationCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.CONSUMER.RESERVATION_DETAIL}
                element={
                  <ProtectedRoute requiredUserType="CONSUMER">
                    <ConsumerReservationDetail />
                  </ProtectedRoute>
                }
              />
              {/* <Route
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
              <Route
                path={ROUTES.MANAGER.PROFILE_SETUP}
                element={
                  <ProtectedRoute requiredUserType="MANAGER">
                    <ManagerProfileSetup />
                  </ProtectedRoute>
                }
              />
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

              <Route
                path={ROUTES.CONSUMER.LIKED_MANAGERS}
                element={
                  <ProtectedRoute requiredUserType="CONSUMER">
                    <ManagerList />
                  </ProtectedRoute>
                }
              />

              {/* Manager Routes */}
              <Route
                path={ROUTES.MANAGER.RESERVATIONS}
                element={
                  <ProtectedRoute requiredUserType="MANAGER">
                    <ManagerReservations />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.MANAGER.RESERVATION_DETAIL}
                element={
                  <ProtectedRoute requiredUserType="MANAGER">
                    <ManagerReservationDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.MANAGER.MATCHING}
                element={
                  <ProtectedRoute requiredUserType="MANAGER">
                    <ManagerMatching />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route path={ROUTES.ADMIN.LOGIN} element={<AdminLogin />} />
              <Route
                path={ROUTES.ADMIN.DASHBOARD}
                element={
                  <ProtectedRoute requiredUserType="ADMIN">
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="users" element={<AdminUserList />} />
                <Route path="users/manager/:id" element={<AdminManagerDetail />} />
                <Route path="users/consumer/:id" element={<AdminConsumerDetail />} />
                <Route path="reservations" element={<AdminReservationList />} />
                <Route path="reservations/:id" element={<AdminReservationDetail />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="events/create" element={<AdminEventCreate />} />
                <Route path="events/:id/edit" element={<AdminEventEdit />} />
                <Route path="events/:id" element={<AdminEventDetail />} />
                <Route path="boards" element={<AdminBoards />} />
                <Route path="boards/:id" element={<AdminBoardDetail />} />
                <Route path="boards/:id/edit" element={<AdminBoardEdit />} />
                <Route index element={<AdminUserList />} />
              </Route>

              {/* Board Routes */}
              <Route path={ROUTES.BOARD.LIST} element={<BoardList />} />
              <Route
                path={ROUTES.BOARD.CREATE}
                element={
                  <ProtectedRoute>
                    <BoardCreate />
                  </ProtectedRoute>
                }
              />
              <Route path={ROUTES.BOARD.DETAIL} element={<BoardDetail />} />
              <Route
                path={ROUTES.BOARD.EDIT}
                element={
                  <ProtectedRoute>
                    <BoardEdit />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;

