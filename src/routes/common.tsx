import { Route } from 'react-router-dom';
import { ROUTES } from '@/constants';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import SocialSignUp from '@/pages/SocialSignUp';
import GoogleCallback from '@/pages/GoogleCallback';
import NotFound from '@/pages/NotFound';

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
