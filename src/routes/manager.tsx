import { Route } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { ProtectedRoute } from '@/components/common';
import {
  ManagerProfileSetup,
  ManagerProfileEdit,
  ManagerMyPage,
  ManagerReviews,
  ManagerReservations,
  ManagerReservationDetail,
  ManagerReviewRegister,
  ManagerSettlements,
  ManagerProfile,
} from '@/pages';

export const ManagerRoutes = () => (
  <>
    <Route
      path={ROUTES.MANAGER.PROFILE_SETUP}
      element={
        <ProtectedRoute
          requireAuth={true}
          requiredUserType="MANAGER"
          checkProfile={true}
          redirectIfProfileExists={true} // 🔥 프로필 있으면 차단
          profileRedirectTo={ROUTES.MANAGER.MYPAGE}
        >
          <ManagerProfileSetup />
        </ProtectedRoute>
      }
    />

    <Route
      path={ROUTES.MANAGER.MYPAGE}
      element={
        <ProtectedRoute requireAuth={true} requiredUserType="MANAGER">
          <ManagerMyPage />
        </ProtectedRoute>
      }
    />

    <Route
      path={ROUTES.MANAGER.PROFILE}
      element={
        <ProtectedRoute
          requireAuth={true}
          requiredUserType="MANAGER"
          checkProfile={true}
          redirectIfNoProfile={true}
        >
          <ManagerProfile />
        </ProtectedRoute>
      }
    />

    <Route
      path={ROUTES.MANAGER.PROFILE_EDIT}
      element={
        <ProtectedRoute
          requireAuth={true}
          requiredUserType="MANAGER"
          checkProfile={true}
          redirectIfNoProfile={true}
        >
          <ManagerProfileEdit />
        </ProtectedRoute>
      }
    />

    <Route
      path={ROUTES.MANAGER.REVIEWS}
      element={
        <ProtectedRoute requireAuth={true} requiredUserType="MANAGER">
          <ManagerReviews />
        </ProtectedRoute>
      }
    />

    <Route
      path={ROUTES.MANAGER.RESERVATIONS}
      element={
        <ProtectedRoute requireAuth={true} requiredUserType="MANAGER">
          <ManagerReservations />
        </ProtectedRoute>
      }
    />

    <Route
      path={ROUTES.MANAGER.RESERVATION_DETAIL}
      element={
        <ProtectedRoute requireAuth={true} requiredUserType="MANAGER">
          <ManagerReservationDetail />
        </ProtectedRoute>
      }
    />

    <Route
      path={ROUTES.MANAGER.REVIEW_REGISTER}
      element={
        <ProtectedRoute requireAuth={true} requiredUserType="MANAGER">
          <ManagerReviewRegister />
        </ProtectedRoute>
      }
    />

    <Route
      path={ROUTES.MANAGER.SETTLEMENTS}
      element={
        <ProtectedRoute requireAuth={true} requiredUserType="MANAGER">
          <ManagerSettlements />
        </ProtectedRoute>
      }
    />
  </>
);
