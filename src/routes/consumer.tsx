import { Route } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { ProtectedRoute } from '@/components/common';
import ConsumerProfileSetup from '@/pages/consumer/ConsumerProfileSetup';
import ConsumerMyPage from '@/pages/consumer/MyPage';
import ConsumerProfile from '@/pages/consumer/Profile';
import ConsumerProfileEdit from '@/pages/consumer/ProfileEdit';
import ConsumerReservations from '@/pages/reservation/ConsumerReservations';
import ConsumerReservationCreate from '@/pages/reservation/ConsumerReservationCreate';
import ConsumerReservationDetail from '@/pages/reservation/ConsumerReservationDetail';
import ConsumerReviewRegister from '@/pages/consumer/ReviewRegister';
import ManagerList from '@/pages/consumer/ManagerList';

export const ConsumerRoutes = () => (
  <>
    <Route
      path={ROUTES.CONSUMER.PROFILE_SETUP}
      element={
        <ProtectedRoute requiredUserType="CONSUMER">
          <ConsumerProfileSetup />
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
      path={ROUTES.CONSUMER.PROFILE_EDIT}
      element={
        <ProtectedRoute requiredUserType="CONSUMER">
          <ConsumerProfileEdit />
        </ProtectedRoute>
      }
    />
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
      path={ROUTES.CONSUMER.REVIEW_REGISTER}
      element={
        <ProtectedRoute requiredUserType="CONSUMER">
          <ConsumerReviewRegister />
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
  </>
);
