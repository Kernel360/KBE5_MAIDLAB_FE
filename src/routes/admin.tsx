import { Route } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { AdminProtectedRoute } from '@/components/common';
import {
  AdminLogin,
  AdminLayout,
  AdminManagerList,
  AdminConsumerList,
  AdminManagerDetail,
  AdminConsumerDetail,
  AdminReservationList,
  AdminReservationDetail,
  AdminSettlementList,
  AdminSettlementDetail,
  AdminEvents,
  AdminEventCreate,
  AdminManagerBoards,
  AdminConsumerBoards,
  AdminBoardDetail,
  AdminBoardEdit,
  AdminEventEdit,
  AdminEventDetail,
  Dashboard,
} from '@/pages';

export const AdminRoutes = () => (
  <>
    <Route path={ROUTES.ADMIN.LOGIN} element={<AdminLogin />} />
    <Route
      path={ROUTES.ADMIN.DASHBOARD}
      element={
        <AdminProtectedRoute>
          <AdminLayout />
        </AdminProtectedRoute>
      }
    >
      <Route path="managers" element={<AdminManagerList />} />
      <Route path="manager/:id" element={<AdminManagerDetail />} />
      <Route path="consumers" element={<AdminConsumerList />} />
      <Route path="consumer/:id" element={<AdminConsumerDetail />} />
      <Route path="reservations" element={<AdminReservationList />} />
      <Route path="reservations/:id" element={<AdminReservationDetail />} />
      <Route path="settlements" element={<AdminSettlementList />} />
      <Route
        path="settlements/:settlementId"
        element={<AdminSettlementDetail />}
      />
      <Route path="events" element={<AdminEvents />} />
      <Route path="events/create" element={<AdminEventCreate />} />
      <Route path="events/:id/edit" element={<AdminEventEdit />} />
      <Route path="events/:id" element={<AdminEventDetail />} />
      <Route path="boards/manager" element={<AdminManagerBoards />} />
      <Route path="boards/consumer" element={<AdminConsumerBoards />} />
      <Route path="boards/:id" element={<AdminBoardDetail />} />
      <Route path="boards/:id/edit" element={<AdminBoardEdit />} />
      <Route index element={<Dashboard />} />
    </Route>
  </>
);
