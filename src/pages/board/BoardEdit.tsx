import { useParams, useNavigate } from 'react-router-dom';
import BoardForm from '@/components/board/BoardForm';

export default function BoardEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    navigate('/board');
    return null;
  }

  return (
    <BoardForm
      mode="edit"
      boardId={parseInt(id)}
      onSuccess={() => navigate(`/board/${id}`)}
    />
  );
} 