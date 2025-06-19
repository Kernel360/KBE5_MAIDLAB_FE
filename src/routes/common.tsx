import { Route } from 'react-router-dom';
import { ROUTES } from '@/constants';
import {
  Home,
  Login,
  SignUp,
  SocialSignUp,
  GoogleCallback,
  NotFound,
} from '@/pages';

export const CommonRoutes = () => (
  <>
    <Route key="home" path={ROUTES.HOME} element={<Home />} />
    <Route key="login" path={ROUTES.LOGIN} element={<Login />} />
    <Route key="signup" path={ROUTES.SIGNUP} element={<SignUp />} />
    <Route
      key="social_signup"
      path={ROUTES.SOCIAL_SIGNUP}
      element={<SocialSignUp />}
    />
    <Route
      key="google_callback"
      path="/google-callback"
      element={<GoogleCallback />}
    />
    <Route key="not_found" path={ROUTES.NOT_FOUND} element={<NotFound />} />
    <Route key="any_page" path="*" element={<NotFound />} />
  </>
);
