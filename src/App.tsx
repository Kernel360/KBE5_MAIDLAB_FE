import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { ROUTES, ROUTE_COMPONENTS } from './constants';
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
              <Route path="reservations" element={<ROUTE_COMPONENTS.ADMIN.RESERVATIONS />} />
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
