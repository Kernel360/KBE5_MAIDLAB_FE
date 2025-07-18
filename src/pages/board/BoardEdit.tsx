import { useParams, useNavigate } from 'react-router-dom';
import BoardForm from '@/components/features/board/BoardForm';
import { Header } from '@/components/layout/Header/Header';
import { ROUTES } from '@/constants/route';

export default function BoardEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    navigate('/board');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        variant="sub"
        title="문의 수정"
        backRoute={ROUTES.BOARD.DETAIL.replace(':id', id)}
        showMenu={false}
      />
      <main className="px-4 py-6 pb-20">
        <div className="max-w-md mx-auto">
          <BoardForm
            mode="edit"
            boardId={parseInt(id)}
            onSuccess={() => navigate(`/board/${id}`)}
          />
        </div>
      </main>
    </div>
  );
}
