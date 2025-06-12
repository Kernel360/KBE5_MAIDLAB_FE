import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/route';

interface BoardHeaderProps {
  title: string;
  showCreateButton?: boolean;
  createButtonText?: string;
  onBackClick?: () => void;
}

export default function BoardHeader({
  title,
  showCreateButton = true,
  createButtonText = '문의하기',
  onBackClick,
}: BoardHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        {onBackClick && (
          <button
            onClick={onBackClick}
            className="text-gray-500 hover:text-gray-700"
          >
            ←
          </button>
        )}
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      {showCreateButton && (
        <button
          onClick={() => navigate(ROUTES.BOARD.CREATE)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          {createButtonText}
        </button>
      )}
    </div>
  );
} 