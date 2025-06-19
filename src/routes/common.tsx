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
    <Route path={ROUTES.HOME} element={<Home />} />
    <Route path={ROUTES.LOGIN} element={<Login />} />
    <Route path={ROUTES.SIGNUP} element={<SignUp />} />
    <Route path={ROUTES.SOCIAL_SIGNUP} element={<SocialSignUp />} />
    <Route path={ROUTES.GOOGLE_CALLBACK} element={<GoogleCallback />} />
    <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
    <Route path="*" element={<NotFound />} />
  </>
);
