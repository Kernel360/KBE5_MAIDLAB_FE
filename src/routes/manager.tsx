import { Route } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { ProtectedRoute } from '@/components/common';

import {
  ManagerProfileSetup,
  ManagerMyPage,
  ManagerReservations,
  ManagerReservationDetail,
  ManagerReviewRegister,
  ManagerMatching,
  ManagerSettlements,
  ManagerProfile,
} from '@/pages';
import ManagerProfileEdit from '@/pages/manager/ManagerProfileEdit';

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
      path={ROUTES.MANAGER.MYPAGE}
      element={
        <ProtectedRoute requiredUserType="MANAGER">
          <ManagerMyPage />
        </ProtectedRoute>
      }
    />
    <Route
      path={ROUTES.MANAGER.PROFILE}
      element={
        <ProtectedRoute requiredUserType="MANAGER">
          <ManagerProfile />
        </ProtectedRoute>
      }
    />
    <Route
      path={ROUTES.MANAGER.PROFILE_EDIT}
      element={
        <ProtectedRoute requiredUserType="MANAGER">
          <ManagerProfileEdit />
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
    {/* <Route
      path={ROUTES.MANAGER.MATCHING}
      element={
        <ProtectedRoute requiredUserType="MANAGER">
          <ManagerMatching />
        </ProtectedRoute>
      }
    /> */}
    <Route
      path={ROUTES.MANAGER.SETTLEMENTS}
      element={
        <ProtectedRoute requiredUserType="MANAGER">
          <ManagerSettlements />
        </ProtectedRoute>
      }
    />
  </>
);
