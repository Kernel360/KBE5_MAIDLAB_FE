import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/route';
import BoardForm from '@/components/features/board/BoardForm';
import { Header } from '@/components/layout/Header/Header';

export default function BoardCreate() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        variant="sub"
        title="문의 작성"
        backRoute={ROUTES.BOARD.LIST}
        showMenu={false}
      />
      <main className="px-4 py-6 pb-20">
        <div className="max-w-md mx-auto">
          <BoardForm
            mode="create"
            onSuccess={() => navigate(ROUTES.BOARD.LIST)}
          />
        </div>
      </main>
    </div>
  );
}
