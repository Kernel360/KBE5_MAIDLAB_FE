import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/route';
import BoardForm from '@/components/features/board/BoardForm';
import { Header } from '@/components/layout/Header/Header';

export default function BoardCreate() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        variant="sub"
        title="문의 작성"
        backRoute={ROUTES.BOARD.LIST}
        showMenu={false}
      />
      <div className="py-0">
        <BoardForm
          mode="create"
          onSuccess={() => navigate(ROUTES.BOARD.LIST)}
        />
      </div>
    </div>
  );
}
