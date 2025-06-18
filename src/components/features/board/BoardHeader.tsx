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
            className="p-2 text-[#FF6B00] hover:bg-[#FFF5EE] rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        )}
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      {showCreateButton && (
        <button
          onClick={() => navigate(ROUTES.BOARD.CREATE)}
          className="px-4 py-2 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF8533]"
        >
          {createButtonText}
        </button>
      )}
    </div>
  );
} 