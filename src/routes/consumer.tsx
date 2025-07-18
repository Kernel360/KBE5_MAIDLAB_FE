import { Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ROUTES } from '@/constants';
import { ProtectedRoute } from '@/components/common';
import GoogleMap from '@/pages/reservation/GoogleMap';
import { Status, Wrapper } from '@googlemaps/react-wrapper';

// 페이지 컴포넌트들을 lazy loading으로 변경 (예약 생성 페이지는 제외)
const ConsumerProfileSetup = lazy(() => import('@/pages/consumer/ConsumerProfileSetup'));
const ConsumerMyPage = lazy(() => import('@/pages/consumer/MyPage'));
const ConsumerProfile = lazy(() => import('@/pages/consumer/Profile'));
const ConsumerProfileEdit = lazy(() => import('@/pages/consumer/ProfileEdit'));
const ConsumerReservations = lazy(() => import('@/pages/reservation/ConsumerReservations'));
const ConsumerReservationDetail = lazy(() => import('@/pages/reservation/ConsumerReservationDetail'));
const ConsumerReviewRegister = lazy(() => import('@/pages/consumer/ConsumerReviewRegister'));
const LikedManagerList = lazy(() => import('@/pages/consumer/LikedManagerList'));
const BlackListManagerList = lazy(() => import('@/pages/consumer/BlackListManagerList'));
const PointsPage = lazy(() => import('@/pages/consumer/PointsPage'));

// 예약 생성 페이지는 일반 import (지도 로딩 최적화를 위해)
import ConsumerReservationCreate from '@/pages/reservation/ConsumerReservationCreate';

// 로딩 컴포넌트
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="flex items-center">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mr-3" />
      <span className="text-lg text-gray-700">페이지 로딩 중...</span>
    </div>
  </div>
);

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mr-3" />
            <span className="text-lg text-gray-700">지도 로딩 중...</span>
          </div>
        </div>
      );
    case Status.FAILURE:
      return (
        <div className="flex items-center justify-center min-h-screen">
          <span className="text-lg text-red-500">지도 로딩 실패</span>
        </div>
      );
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
          <Suspense fallback={<PageLoader />}>
            <ConsumerProfileSetup />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={ROUTES.CONSUMER.MYPAGE}
      element={
        <ProtectedRoute requiredUserType="CONSUMER">
          <Suspense fallback={<PageLoader />}>
            <ConsumerMyPage />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={ROUTES.CONSUMER.PROFILE}
      element={
        <ProtectedRoute requiredUserType="CONSUMER">
          <Suspense fallback={<PageLoader />}>
            <ConsumerProfile />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={ROUTES.CONSUMER.PROFILE_EDIT}
      element={
        <ProtectedRoute requiredUserType="CONSUMER">
          <Suspense fallback={<PageLoader />}>
            <ConsumerProfileEdit />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={ROUTES.CONSUMER.RESERVATIONS}
      element={
        <ProtectedRoute requiredUserType="CONSUMER">
          <Suspense fallback={<PageLoader />}>
            <ConsumerReservations />
          </Suspense>
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
            libraries={['places']}
            language="ko"
            region="KR"
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
          <Suspense fallback={<PageLoader />}>
            <ConsumerReservationDetail />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={ROUTES.CONSUMER.REVIEW_REGISTER}
      element={
        <ProtectedRoute requiredUserType="CONSUMER">
          <Suspense fallback={<PageLoader />}>
            <ConsumerReviewRegister />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={ROUTES.CONSUMER.LIKED_MANAGERS}
      element={
        <ProtectedRoute requiredUserType="CONSUMER">
          <Suspense fallback={<PageLoader />}>
            <LikedManagerList />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={ROUTES.CONSUMER.BLACKLIST}
      element={
        <ProtectedRoute requiredUserType="CONSUMER">
          <Suspense fallback={<PageLoader />}>
            <BlackListManagerList />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={ROUTES.CONSUMER.POINTS}
      element={
        <ProtectedRoute requiredUserType="CONSUMER">
          <Suspense fallback={<PageLoader />}>
            <PointsPage />
          </Suspense>
        </ProtectedRoute>
      }
    />
  </>
);
