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
} from '@/pages';


// Styles
import '@/styles/index.css';

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
// const ConsumerReservations = React.lazy(
//   () => import('@/pages/consumer/Reservations'),
// );
// const ConsumerReservationDetail = React.lazy(
//   () => import('@/pages/consumer/ReservationDetail'),
// );
const ConsumerReservationCreate = React.lazy(
  () => import('@/pages/reservation/ConsumerReservationCreate'),
);
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
const AppContent: React.FC = () => {
  const { isLoading } = useAuth();

  useEffect(() => {
    // 만료된 로컬스토리지 정리
    clearExpiredLocalStorage();
  }, []);

  // 초기 로딩 중이면 로딩 스피너 표시
  if (isLoading) {
    return <LoadingSpinner />;
  }

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


            {/* 소비자 페이지 (나중에 구현) */}
            {/* 
    
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
              
          {/* 소비자 라우트 */}
          
          {/* <Route
            path={ROUTES.CONSUMER.RESERVATIONS}
            element={
              <ProtectedRoute requiredUserType="CONSUMER">
                <ConsumerReservations />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path={ROUTES.CONSUMER.RESERVATION_DETAIL}
            element={
              <ProtectedRoute requiredUserType="CONSUMER">
                <ConsumerReservationDetail />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path={ROUTES.CONSUMER.RESERVATION_CREATE}
            element={
              // <ProtectedRoute requiredUserType="CONSUMER">
                <ConsumerReservationCreate />
              // </ProtectedRoute>
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

            {/* 게시판 관리 */}
            <Route path="boards" element={<AdminBoards />} />
            <Route path="boards/:id" element={<AdminBoardDetail />} />

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
