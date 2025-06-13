import { Route } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { ProtectedRoute } from '@/components/common';
import ManagerProfileSetup from '@/pages/ManagerProfileSetup';
import ManagerReservations from '@/pages/reservation/ManagerReservations';
import ManagerReservationDetail from '@/pages/reservation/ManagerReservationDetail';
import ManagerReviewRegister from '@/pages/manager/ReviewRegister';
import ManagerMatching from '@/pages/matching/ManagerMatching';

export const ManagerRoutes = () => (
  <>
    <Route
      path={ROUTES.MANAGER.PROFILE_SETUP}
      element={
        <ProtectedRoute requiredUserType="MANAGER">
          <ManagerProfileSetup />
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
      path={ROUTES.MANAGER.RESERVATION_DETAIL}
      element={
        <ProtectedRoute requiredUserType="MANAGER">
          <ManagerReservationDetail />
        </ProtectedRoute>
      }
    />
    <Route
      path={ROUTES.MANAGER.REVIEW_REGISTER}
      element={
        <ProtectedRoute requiredUserType="MANAGER">
          <ManagerReviewRegister />
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
  </>
);
