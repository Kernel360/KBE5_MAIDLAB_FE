import { Route } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { ProtectedRoute } from '@/components/common';
import {
  Home,
  Login,
  SignUp,
  SocialSignUp,
  GoogleCallback,
  NotFound,
  EventDetail,
  EventList,
} from '@/pages';
import GoogleMap from '@/pages/reservation/GoogleMap';
import { Status, Wrapper } from '@googlemaps/react-wrapper';

export const CommonRoutes = () => (
  <>
    <Route
      path={ROUTES.HOME}
      element={
        <ProtectedRoute
          requireAuth={false} // 비로그인도 접근 가능
          checkProfile={true} // 하지만 로그인된 사용자는 프로필 체크
          redirectIfNoProfile={true} // 프로필 없으면 등록 페이지로
        >
          <Home />
        </ProtectedRoute>
      }
    />

    <Route
      path={ROUTES.LOGIN}
      element={
        <ProtectedRoute requireAuth={false}>
          <Login />
        </ProtectedRoute>
      }
    />

    <Route
      path={ROUTES.SIGNUP}
      element={
        <ProtectedRoute requireAuth={false}>
          <SignUp />
        </ProtectedRoute>
      }
    />

    <Route
      path={ROUTES.SOCIAL_SIGNUP}
      element={
        <ProtectedRoute requireAuth={false}>
          <SocialSignUp />
        </ProtectedRoute>
      }
    />

    <Route
      path={ROUTES.GOOGLE_CALLBACK}
      element={
        <ProtectedRoute requireAuth={false}>
          <GoogleCallback />
        </ProtectedRoute>
      }
    />

    <Route
      path={ROUTES.GOOGLE_MAP}
      element={
        <ProtectedRoute requireAuth={false}>
          <Wrapper
            apiKey={import.meta.env.VITE_GOOGLEMAP_API_KEY}
            render={(status: Status) => {
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
            }}
            libraries={['places']}
            language="ko"
            region="KR"
          >
            <GoogleMap />
          </Wrapper>
        </ProtectedRoute>
      }
    />

    <Route
      path={ROUTES.NOT_FOUND}
      element={
        <ProtectedRoute requireAuth={false}>
          <NotFound />
        </ProtectedRoute>
      }
    />

    <Route
      path={ROUTES.EVENTS}
      element={
        <ProtectedRoute requireAuth={false}>
          <EventList />
        </ProtectedRoute>
      }
    />

    <Route
      path={ROUTES.EVENT_DETAIL}
      element={
        <ProtectedRoute requireAuth={false}>
          <EventDetail />
        </ProtectedRoute>
      }
    />

    <Route
      path="*"
      element={
        <ProtectedRoute requireAuth={false}>
          <NotFound />
        </ProtectedRoute>
      }
    />
  </>
);
