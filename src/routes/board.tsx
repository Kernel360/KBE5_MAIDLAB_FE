import { Route } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { ProtectedRoute } from '@/components/common';
import BoardList from '@/pages/board/BoardList';
import BoardCreate from '@/pages/board/BoardCreate';
import BoardDetail from '@/pages/board/BoardDetail';
import BoardEdit from '@/pages/board/BoardEdit';

export const BoardRoutes = () => (
  <>
    <Route path={ROUTES.BOARD.LIST} element={<BoardList />} />
    <Route
      path={ROUTES.BOARD.CREATE}
      element={
        <ProtectedRoute>
          <BoardCreate />
        </ProtectedRoute>
      }
    />
    <Route path={ROUTES.BOARD.DETAIL} element={<BoardDetail />} />
    <Route
      path={ROUTES.BOARD.EDIT}
      element={
        <ProtectedRoute>
          <BoardEdit />
        </ProtectedRoute>
      }
    />
  </>
);
