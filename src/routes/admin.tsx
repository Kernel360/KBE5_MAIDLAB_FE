import { Route } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { ProtectedRoute } from '@/components/common';
import {
  AdminLogin,
  AdminLayout,
  AdminUserList,
  AdminManagerDetail,
  AdminConsumerDetail,
  AdminReservationList,
  AdminReservationDetail,
  AdminSettlementList,
  AdminEvents,
  AdminEventCreate,
  AdminBoards,
  AdminBoardDetail,
  AdminBoardEdit,
  AdminEventEdit,
  AdminEventDetail,
} from '@/pages';

export const AdminRoutes = () => (
  <>
    <Route path={ROUTES.ADMIN.LOGIN} element={<AdminLogin />} />
    <Route
      path={ROUTES.ADMIN.DASHBOARD}
      element={
        <ProtectedRoute requiredUserType="ADMIN">
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route path="users" element={<AdminUserList />} />
      <Route path="users/manager/:id" element={<AdminManagerDetail />} />
      <Route path="users/consumer/:id" element={<AdminConsumerDetail />} />
      <Route path="reservations" element={<AdminReservationList />} />
      <Route path="reservations/:id" element={<AdminReservationDetail />} />
      <Route path="settlements" element={<AdminSettlementList />} />
      <Route path="events" element={<AdminEvents />} />
      <Route path="events/create" element={<AdminEventCreate />} />
      <Route path="events/:id/edit" element={<AdminEventEdit />} />
      <Route path="events/:id" element={<AdminEventDetail />} />
      <Route path="boards" element={<AdminBoards />} />
      <Route path="boards/:id" element={<AdminBoardDetail />} />
      <Route path="boards/:id/edit" element={<AdminBoardEdit />} />
      <Route index element={<AdminUserList />} />
    </Route>
  </>
);
