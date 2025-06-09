import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { ROUTES } from './constants';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/layout/AdminLayout';
import UserList from './pages/admin/UserList';
import ManagerDetail from './pages/admin/ManagerDetail';
import ConsumerDetail from './pages/admin/ConsumerDetail';
import ReservationList from './pages/admin/ReservationList';
import ReservationDetail from './pages/admin/ReservationDetail';
import EventList from './pages/admin/EventList';
import BoardList from './pages/admin/BoardList';

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

// 관리자 라우트 설정
const AdminRoutes = [
  // 관리자 로그인 페이지
  <Route key="admin-login" path={ROUTES.ADMIN.LOGIN} element={<AdminLogin />} />,
  
  // 관리자 대시보드 및 하위 페이지들
  <Route
    key="admin-dashboard"
    path={ROUTES.ADMIN.DASHBOARD}
    element={
      <ProtectedRoute>
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
    
    {/* 게시판 관리 */}
    <Route path="boards" element={<BoardList />} />
    
    {/* 기본 리다이렉트 */}
    <Route index element={<Navigate to="/admin/users" replace />} />
  </Route>
];

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* 관리자 라우트 */}
            {AdminRoutes}
            
            {/* 홈 페이지 리다이렉트 */}
            <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LOGIN} replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
