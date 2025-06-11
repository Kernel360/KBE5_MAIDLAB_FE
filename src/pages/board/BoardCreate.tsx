import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/route';
import BoardForm from '@/components/board/BoardForm';

export default function BoardCreate() {
  const navigate = useNavigate();

  return (
    <BoardForm
      mode="create"
      onSuccess={() => navigate(ROUTES.BOARD.LIST)}
    />
  );
} 