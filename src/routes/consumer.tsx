import { Route } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { ProtectedRoute } from '@/components/common';
import GoogleMap from '@/pages/reservation/GoogleMap';
import { Status, Wrapper } from '@googlemaps/react-wrapper';
import {
  ConsumerProfileSetup,
  ConsumerMyPage,
  ConsumerProfile,
  ConsumerProfileEdit,
  ConsumerReservations,
  ConsumerReservationCreate,
  ConsumerReservationDetail,
  ConsumerReviewRegister,
  LikedManagerList,
  BlackListManagerList,
  PointsPage,
} from '@/pages';

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return <>로딩중...</>;
    case Status.FAILURE:
      return <>에러 발생</>;
    case Status.SUCCESS:
      return <GoogleMap />;
  }
};

export const ConsumerRoutes = () => (
  <>
    <Route
      path={ROUTES.CONSUMER.PROFILE_SETUP}
      element={
        <ProtectedRoute
          requireAuth={true}
          requiredUserType="CONSUMER"
          checkProfile={true}
          redirectIfProfileExists={true} // 🔥 프로필 있으면 차단
          profileRedirectTo={ROUTES.CONSUMER.MYPAGE}
        >
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
          <Wrapper
            apiKey={import.meta.env.VITE_GOOGLEMAP_API_KEY}
            render={render}
          >
            <ConsumerReservationCreate />
          </Wrapper>
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
          <LikedManagerList />
        </ProtectedRoute>
      }
    />
    <Route
      path={ROUTES.CONSUMER.BLACKLIST}
      element={
        <ProtectedRoute requiredUserType="CONSUMER">
          <BlackListManagerList />
        </ProtectedRoute>
      }
    />
    <Route
      path={ROUTES.CONSUMER.POINTS}
      element={
        <ProtectedRoute requiredUserType="CONSUMER">
          <PointsPage />
        </ProtectedRoute>
      }
    />
  </>
);
