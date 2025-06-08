import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import AdminLogin from './pages/admin/AdminLogin';
import UserList from './pages/admin/UserList';
import AdminLayout from './pages/admin/layout/AdminLayout';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="users" element={<UserList />} />
              <Route path="reservations" element={<div>예약 관리 페이지</div>} />
              <Route path="events" element={<div>이벤트 관리 페이지</div>} />
              <Route path="boards" element={<div>게시판 관리 페이지</div>} />
              <Route index element={<Navigate to="/admin/users" replace />} />
            </Route>
            <Route path="/" element={<Navigate to="/admin/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
