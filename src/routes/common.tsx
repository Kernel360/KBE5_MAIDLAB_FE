import { Route } from 'react-router-dom';
import { ROUTES } from '@/constants';
import Home from '@/pages/common/Home';
import Login from '@/pages/common/Login';
import SignUp from '@/pages/common/SignUp';
import SocialSignUp from '@/pages/common/SocialSignUp';
import GoogleCallback from '@/pages/common/GoogleCallback';
import NotFound from '@/pages/common/NotFound';

export const CommonRoutes = () => (
  <>
    <Route path={ROUTES.HOME} element={<Home />} />
    <Route path={ROUTES.LOGIN} element={<Login />} />
    <Route path={ROUTES.SIGNUP} element={<SignUp />} />
    <Route path={ROUTES.SOCIAL_SIGNUP} element={<SocialSignUp />} />
    <Route path={ROUTES.GOOGLE_CALLBACK} element={<GoogleCallback />} />
    <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
    <Route path="*" element={<NotFound />} />
  </>
);
