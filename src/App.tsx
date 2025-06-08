import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { ROUTES, ROUTE_COMPONENTS } from './constants';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ManagerDetail from './pages/admin/ManagerDetail';
import ConsumerDetail from './pages/admin/ConsumerDetail';
import ReservationDetail from './pages/admin/ReservationDetail';

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
            <Route path={ROUTES.ADMIN.LOGIN} element={<ROUTE_COMPONENTS.ADMIN.LOGIN />} />
            <Route
              path={ROUTES.ADMIN.DASHBOARD}
              element={
                <ProtectedRoute>
                  <ROUTE_COMPONENTS.ADMIN.LAYOUT />
                </ProtectedRoute>
              }
            >
              <Route path="users" element={<ROUTE_COMPONENTS.ADMIN.USERS />} />
              <Route path="users/manager/:id" element={<ManagerDetail />} />
              <Route path="users/consumer/:id" element={<ConsumerDetail />} />
              <Route path="reservations" element={<ROUTE_COMPONENTS.ADMIN.RESERVATIONS />} />
              <Route path="reservations/:id" element={<ReservationDetail />} />
              <Route path="events" element={<ROUTE_COMPONENTS.ADMIN.EVENTS />} />
              <Route path="boards" element={<ROUTE_COMPONENTS.ADMIN.BOARDS />} />
              <Route index element={<Navigate to="/admin/users" replace />} />
            </Route>
            <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.ADMIN.LOGIN} replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
