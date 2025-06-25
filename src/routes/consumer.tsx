import { Route } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { ProtectedRoute } from '@/components/common';
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
} from '@/pages';
import GoogleMap from '@/pages/reservation/GoogleMap';
import { Status, Wrapper } from '@googlemaps/react-wrapper';
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
    <Route path={'/google-map'} element={<GoogleMap />} />
  </>
);
