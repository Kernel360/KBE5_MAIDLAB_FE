import React, { useEffect, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ThemeProvider, ToastProvider, useAuth } from '@/hooks'; // ToastProvider 추가
import { ProtectedRoute, ToastContainer } from '@/components/common';
import React, { useEffect, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ThemeProvider, useAuth } from '@/hooks';
import { ROUTES } from '@/constants';
import { clearExpiredLocalStorage } from '@/utils';
import '@/styles/index.css';
import { clearExpiredLocalStorage } from '@/utils';
import '@/styles/index.css';

// Pages - 개별 import로 변경
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import NotFound from '@/pages/NotFound';
import GoogleCallback from '@/pages/GoogleCallback';
import SocialSignUp from '@/pages/SocialSignUp';
import ConsumerReservations from '@/pages/reservation/ConsumerReservations';
import ConsumerReservationCreate from '@/pages/reservation/ConsumerReservationCreate';
import ConsumerReservationDetail from '@/pages/reservation/ConsumerReservationDetail';
import ManagerReservations from '@/pages/reservation/ManagerReservations';
import ManagerReservationDetail from '@/pages/reservation/ManagerReservationDetail';
import { ManagerMatching } from '@/pages/matching/ManagerMatching';
import ConsumerMyPage from '@/pages/consumer/MyPage';
import ConsumerProfile from '@/pages/consumer/Profile';
import ManagerList from '@/pages/consumer/ManagerList';
import ConsumerReservations from '@/pages/reservation/ConsumerReservations';
import ConsumerReservationCreate from '@/pages/reservation/ConsumerReservationCreate';
import ConsumerReservationDetail from '@/pages/reservation/ConsumerReservationDetail';
import ManagerReservations from '@/pages/reservation/ManagerReservations';
import ManagerReservationDetail from '@/pages/reservation/ManagerReservationDetail';
import { ManagerMatching } from '@/pages/matching/ManagerMatching';

import ConsumerMyPage from '@/pages/consumer/MyPage';
import ConsumerProfile from '@/pages/consumer/Profile';
import ManagerList from '@/pages/consumer/ManagerList';

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
} from '@/pages';

import BoardList from '@/pages/board/BoardList';
import BoardCreate from '@/pages/board/BoardCreate';
import BoardDetail from '@/pages/board/BoardDetail';
import BoardEdit from '@/pages/board/BoardEdit';

// Styles
import '@/styles/index.css';

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredUserType && userType !== requiredUserType) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
};

// 토스트 컨테이너 컴포넌트
const ToastContainer: React.FC = () => {
  // 실제 토스트 라이브러리 사용시 여기에 구현
  return null;
};

// 메인 앱 컴포넌트
const App: React.FC = () => {
import { clearExpiredLocalStorage } from '@/utils';
import '@/styles/index.css';

// 페이지 컴포넌트들 (Lazy Loading)
// const HomePage = React.lazy(() => import('@/pages/Home'));
// const LoginPage = React.lazy(() => import('@/pages/Login'));
// const SignUpPage = React.lazy(() => import('@/pages/SignUp'));
// const NotFoundPage = React.lazy(() => import('@/pages/NotFound'));


// 소비자 페이지들
// const ConsumerMyPage = React.lazy(() => import('@/pages/consumer/MyPage'));
// const ConsumerProfile = React.lazy(() => import('@/pages/consumer/Profile'));
// const ConsumerLikedManagers = React.lazy(
//   () => import('@/pages/consumer/LikedManagers'),
// );
// const ConsumerBlacklist = React.lazy(
//   () => import('@/pages/consumer/Blacklist'),
// );

// 매니저 페이지들
// const ManagerMyPage = React.lazy(() => import('@/pages/manager/MyPage'));
// const ManagerProfile = React.lazy(() => import('@/pages/manager/Profile'));
// const ManagerProfileCreate = React.lazy(
//   () => import('@/pages/manager/ProfileCreate'),
// );
// const ManagerReservations = React.lazy(
//   () => import('@/pages/manager/Reservations'),
// );
// const ManagerReservationDetail = React.lazy(
//   () => import('@/pages/manager/ReservationDetail'),
// );
// const ManagerReviews = React.lazy(() => import('@/pages/manager/Reviews'));
// const ManagerMatching = React.lazy(() => import('@/pages/manager/Matching'));
// const ManagerSettlements = React.lazy(
//   () => import('@/pages/manager/Settlements'),
// );

// 관리자 페이지들
// const AdminDashboard = React.lazy(() => import('@/pages/admin/Dashboard'));
// const AdminLogin = React.lazy(() => import('@/pages/admin/Login'));
// const AdminManagers = React.lazy(() => import('@/pages/admin/Managers'));
// const AdminManagerDetail = React.lazy(
//   () => import('@/pages/admin/ManagerDetail'),
// );
// const AdminConsumers = React.lazy(() => import('@/pages/admin/Consumers'));
// const AdminConsumerDetail = React.lazy(
//   () => import('@/pages/admin/ConsumerDetail'),
// );
// const AdminReservations = React.lazy(
//   () => import('@/pages/admin/Reservations'),
// );
// const AdminReservationDetail = React.lazy(
//   () => import('@/pages/admin/ReservationDetail'),
// );
// const AdminMatching = React.lazy(() => import('@/pages/admin/Matching'));
// const AdminSettlements = React.lazy(() => import('@/pages/admin/Settlements'));
// const AdminEvents = React.lazy(() => import('@/pages/admin/Events'));
// const AdminEventCreate = React.lazy(() => import('@/pages/admin/EventCreate'));
// const AdminEventEdit = React.lazy(() => import('@/pages/admin/EventEdit'));
// const AdminBoards = React.lazy(() => import('@/pages/admin/Boards'));
// const AdminBoardDetail = React.lazy(() => import('@/pages/admin/BoardDetail'));

// 공통 페이지들
// const EventsPage = React.lazy(() => import('@/pages/Events'));
// const EventDetailPage = React.lazy(() => import('@/pages/EventDetail'));
// const BoardPage = React.lazy(() => import('@/pages/Board'));
// const BoardCreatePage = React.lazy(() => import('@/pages/BoardCreate'));
// const BoardDetailPage = React.lazy(() => import('@/pages/BoardDetail'));

// 로딩 컴포넌트
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// 보호된 라우트 컴포넌트
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

// 토스트 컨테이너 컴포넌트
const ToastContainer: React.FC = () => {
  // 실제 토스트 라이브러리 사용시 여기에 구현
  return null;
};

// 메인 앱 컴포넌트
const App: React.FC = () => {
  return ( 
    <ThemeProvider>
      <ToastProvider>
        {' '}
        {/* ToastProvider 추가 */}
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
    <AuthProvider>
      <ThemeProvider>
        <div className="App">
          <Routes>
            {/* 공통 페이지 */}
            <Route path={ROUTES.HOME} element={<Home />} />
            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route path={ROUTES.SIGNUP} element={<SignUp />} />
            <Route path={ROUTES.SOCIAL_SIGNUP} element={<SocialSignUp />} />
            <Route path="/google-callback" element={<GoogleCallback />} />

              {/* 게시판 페이지 (나중에 구현) */}
              {/* <Route path={ROUTES.BOARD} element={<Board />} />
                <Route path={ROUTES.BOARD_CREATE} element={<BoardCreate />} />
                <Route path={ROUTES.BOARD_DETAIL} element={<BoardDetail />} /> */}
              {/* 소비자 페이지 (나중에 구현) */}
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
                path={ROUTES.CONSUMER.LIKED_MANAGERS}
                element={
                  <ProtectedRoute requiredUserType="CONSUMER">
                    <ManagerList />
                  </ProtectedRoute>
                }
              /> 
              <Route
                path={ROUTES.CONSUMER.BLACKLIST}
                element={
                  <ProtectedRoute requiredUserType="CONSUMER">
                    <ManagerList />
                  </ProtectedRoute>
                }
              /> 
              {/* 매니저 라우트들 */}
                        <Route
            path={ROUTES.MANAGER.RESERVATIONS}
            element={
              <ProtectedRoute requiredUserType="MANAGER">
                <ManagerReservations />
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
          <Route
            path={ROUTES.MANAGER.RESERVATION_DETAIL}
            element={
              <ProtectedRoute requiredUserType="MANAGER">
                <ManagerReservationDetail />
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
              {/* <Route
                path={ROUTES.CONSUMER.RESERVATIONS}
                element={
                  <ProtectedRoute requiredUserType="CONSUMER">
                    <ConsumerReservations />
                  </ProtectedRoute>
                }
              /> */}
              {/* <Route
                path={ROUTES.CONSUMER.RESERVATION_CREATE}
                element={
                  <ProtectedRoute requiredUserType="CONSUMER">
                    <ReservationCreate />
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
              <Route
                path={ROUTES.CONSUMER.BLACKLIST}
                element={
                  <ProtectedRoute requiredUserType="CONSUMER">
                    <ManagerList />
                  </ProtectedRoute>
                }
              /> 
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
              path={ROUTES.MANAGER.REVIEWS}
              element={
                <ProtectedRoute requiredUserType="MANAGER">
                  <ManagerReviews />
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
              <Route
                key="admin-login"
                path={ROUTES.ADMIN.LOGIN}
                element={<AdminLogin />}
              />
              , // 관리자 대시보드 및 하위 페이지들
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
                <Route
                  path="users/manager/:id"
                  element={<AdminManagerDetail />}
                />
                <Route
                  path="users/consumer/:id"
                  element={<AdminConsumerDetail />}
                />
                {/* 예약 관리 */}
                <Route path="reservations" element={<AdminReservationList />} />
                <Route
                  path="reservations/:id"
                  element={<AdminReservationDetail />}
                />

                {/* 이벤트 관리 */}
                <Route path="events" element={<AdminEvents />} />
                <Route path="events/create" element={<AdminEventCreate />} />

                {/* 게시판 관리 */}
                <Route path="boards" element={<AdminBoards />} />
                <Route path="boards/:id" element={<AdminBoardDetail />} />

                {/* 기본 리다이렉트 */}
                <Route index element={<AdminUserList />} />
              </Route>
              {/* 게시판 라우트 */}
              <Route
                path={ROUTES.BOARD.LIST}
                element={
                  <ProtectedRoute requiredUserType="CONSUMER">
                    <BoardList />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.BOARD.CREATE}
                element={
                  <ProtectedRoute requiredUserType="CONSUMER">
                    <BoardCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.BOARD.DETAIL}
                element={
                  <ProtectedRoute requiredUserType="CONSUMER">
                    <BoardDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.BOARD.EDIT}
                element={
                  <ProtectedRoute requiredUserType="CONSUMER">
                    <BoardEdit />
                  </ProtectedRoute>
                }
              />
              {/* 404 페이지 */}
              <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <React.Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* 공개 라우트 */}
          {/* <Route path={ROUTES.HOME} element={<HomePage />} /> */}
          {/* <Route path={ROUTES.LOGIN} element={<LoginPage />} /> */}
          {/* <Route path={ROUTES.SIGNUP} element={<SignUpPage />} /> */}
          {/* <Route path={ROUTES.EVENTS} element={<EventsPage />} /> */}
          {/* <Route path={ROUTES.EVENT_DETAIL} element={<EventDetailPage />} /> */}

          {/* 소비자 라우트 */}
          {/* <Route
            path={ROUTES.CONSUMER.MYPAGE}
            element={
              <ProtectedRoute requiredUserType="CONSUMER">
                <ConsumerMyPage />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.CONSUMER.PROFILE}
            element={
              <ProtectedRoute requiredUserType="CONSUMER">
                <ConsumerProfile />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.CONSUMER.RESERVATIONS}
            element={
              <ProtectedRoute requiredUserType="CONSUMER">
                <ConsumerReservations />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            {/* 소비자 라우트 */}
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

          {/* 매니저 라우트 */}
          <Route
            path={ROUTES.CONSUMER.RESERVATION_CREATE}
            element={
              // <ProtectedRoute requiredUserType="CONSUMER">
                <ConsumerReservationCreate />
              // </ProtectedRoute>
            }
          />
          {/* <Route
            path={ROUTES.CONSUMER.LIKED_MANAGERS}
            element={
              <ProtectedRoute requiredUserType="CONSUMER">
                <ConsumerLikedManagers />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.CONSUMER.BLACKLIST}
            element={
              <ProtectedRoute requiredUserType="CONSUMER">
                <ConsumerBlacklist />
              </ProtectedRoute>
            }
          /> */}

          {/* 매니저 라우트 */}
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
          />
          <Route
            path={ROUTES.MANAGER.MATCHING}
            element={
              <ProtectedRoute requiredUserType="ADMIN">
                <AdminEventEdit />
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

          {/* 관리자 라우트 */}
          {/* <Route path={ROUTES.ADMIN.LOGIN} element={<AdminLogin />} /> */}
          {/* <Route
            path={ROUTES.ADMIN.DASHBOARD}
            element={
              <ProtectedRoute requiredUserType="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.ADMIN.MANAGERS}
            element={
              <ProtectedRoute requiredUserType="ADMIN">
                <AdminManagers />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.ADMIN.MANAGER_DETAIL}
            element={
              <ProtectedRoute requiredUserType="ADMIN">
                <AdminManagerDetail />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.ADMIN.CONSUMERS}
            element={
              <ProtectedRoute requiredUserType="ADMIN">
                <AdminConsumers />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.ADMIN.CONSUMER_DETAIL}
            element={
              <ProtectedRoute requiredUserType="ADMIN">
                <AdminConsumerDetail />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.ADMIN.RESERVATIONS}
            element={
              <ProtectedRoute requiredUserType="ADMIN">
                <AdminReservations />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.ADMIN.RESERVATION_DETAIL}
            element={
              <ProtectedRoute requiredUserType="ADMIN">
                <AdminReservationDetail />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.ADMIN.MATCHING}
            element={
              <ProtectedRoute requiredUserType="ADMIN">
                <AdminMatching />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.ADMIN.SETTLEMENTS}
            element={
              <ProtectedRoute requiredUserType="ADMIN">
                <AdminSettlements />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.ADMIN.EVENTS}
            element={
              <ProtectedRoute requiredUserType="ADMIN">
                <AdminEvents />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.ADMIN.EVENT_CREATE}
            element={
              <ProtectedRoute requiredUserType="ADMIN">
                <AdminEventCreate />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.ADMIN.EVENT_EDIT}
            element={
              <ProtectedRoute requiredUserType="ADMIN">
                <AdminEventEdit />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.ADMIN.BOARDS}
            element={
              <ProtectedRoute requiredUserType="ADMIN">
                <AdminBoards />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.ADMIN.BOARD_DETAIL}
            element={
              <ProtectedRoute requiredUserType="ADMIN">
                <AdminBoardDetail />
              </ProtectedRoute>
            }
          /> */}

          {/* 공통 게시판 라우트 */}
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
          {/* <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} /> */}
          <Route
            path="*"
            element={<Navigate to={ROUTES.NOT_FOUND} replace />}
          />
        </Routes>
      </React.Suspense>

            {/* 전역 토스트 컨테이너 */}
            <ToastContainer />
          </div>
        </AuthProvider>
      </ToastProvider>{' '}
      {/* ToastProvider 닫기 */}
    </ThemeProvider>
          {/* 전역 토스트 컨테이너 */}
          <ToastContainer />
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
