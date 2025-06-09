import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ROUTES } from '@/constants';
import { clearExpiredLocalStorage } from '@/utils';

// Admin Pages (현재 구현된 것)
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/layout/AdminLayout';
import UserList from './pages/admin/UserList';
import ManagerDetail from './pages/admin/ManagerDetail';
import ConsumerDetail from './pages/admin/ConsumerDetail';
import ReservationList from './pages/admin/ReservationList';
import ReservationDetail from './pages/admin/ReservationDetail';
import EventList from './pages/admin/EventList';
import EventCreate from './pages/admin/EventCreate';
import BoardList from './pages/admin/BoardList';

// 나머지 페이지 컴포넌트들 (Lazy Loading으로 준비)
// const HomePage = React.lazy(() => import('@/pages/Home'));
// const LoginPage = React.lazy(() => import('@/pages/Login'));
// const SignUpPage = React.lazy(() => import('@/pages/SignUp'));
// const NotFoundPage = React.lazy(() => import('@/pages/NotFound'));

// 소비자 페이지들
// const ConsumerMyPage = React.lazy(() => import('@/pages/consumer/MyPage'));
// const ConsumerProfile = React.lazy(() => import('@/pages/consumer/Profile'));
// const ConsumerReservations = React.lazy(() => import('@/pages/consumer/Reservations'));
// const ConsumerReservationDetail = React.lazy(() => import('@/pages/consumer/ReservationDetail'));
// const ConsumerReservationCreate = React.lazy(() => import('@/pages/consumer/ReservationCreate'));
// const ConsumerLikedManagers = React.lazy(() => import('@/pages/consumer/LikedManagers'));
// const ConsumerBlacklist = React.lazy(() => import('@/pages/consumer/Blacklist'));

// 매니저 페이지들
// const ManagerMyPage = React.lazy(() => import('@/pages/manager/MyPage'));
// const ManagerProfile = React.lazy(() => import('@/pages/manager/Profile'));
// const ManagerProfileCreate = React.lazy(() => import('@/pages/manager/ProfileCreate'));
// const ManagerReservations = React.lazy(() => import('@/pages/manager/Reservations'));
// const ManagerReservationDetail = React.lazy(() => import('@/pages/manager/ReservationDetail'));
// const ManagerReviews = React.lazy(() => import('@/pages/manager/Reviews'));
// const ManagerMatching = React.lazy(() => import('@/pages/manager/Matching'));
// const ManagerSettlements = React.lazy(() => import('@/pages/manager/Settlements'));

// 로딩 컴포넌트
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Theme 설정
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF7F50',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

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
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

// 관리자 라우트 설정
const AdminRoutes = [
  // 관리자 로그인 페이지
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
    <Route path="users" element={<UserList />} />
    <Route path="users/manager/:id" element={<ManagerDetail />} />
    <Route path="users/consumer/:id" element={<ConsumerDetail />} />
    
    {/* 예약 관리 */}
    <Route path="reservations" element={<ReservationList />} />
    <Route path="reservations/:id" element={<ReservationDetail />} />
    
    {/* 이벤트 관리 */}
    <Route path="events" element={<EventList />} />
    <Route path="events/create" element={<EventCreate />} />
    
    {/* 게시판 관리 */}
    <Route path="boards" element={<BoardList />} />
    
    {/* 기본 리다이렉트 */}
    <Route index element={<Navigate to="/admin/users" replace />} />
  </Route>
];

// App 컴포넌트
const App: React.FC = () => {
  useEffect(() => {
    // 만료된 로컬 스토리지 데이터 정리
    clearExpiredLocalStorage();
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <Routes>
          {/* 관리자 라우트 */}
          {AdminRoutes}
          
          {/* 추후 추가될 라우트들을 위한 자리 */}
          {/* 소비자 라우트 */}
          {/* 매니저 라우트 */}
          
          {/* 홈 페이지 리다이렉트 */}
          <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LOGIN} replace />} />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
