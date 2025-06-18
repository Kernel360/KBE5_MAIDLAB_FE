import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/route';
import {
  BOARD_TYPE_LABELS,
  BOARD_TYPE_ICONS,
  BOARD_TYPES,
} from '@/constants/board';
import type { BoardResponse } from '@/types/board';
import type { BoardType } from '@/constants/board';

interface BoardItemProps {
  board: BoardResponse;
}

export default function BoardItem({ board }: BoardItemProps) {
  const navigate = useNavigate();

  // ✅ 더 안전한 타입 체크
  const isValidBoardType = (type: string): type is BoardType => {
    return Object.values(BOARD_TYPES).includes(type as BoardType);
  };

  const boardType = isValidBoardType(board.boardType)
    ? board.boardType
    : BOARD_TYPES.ETC; // 기본값

  return (
    <div
      onClick={() =>
        navigate(
          `${ROUTES.BOARD.DETAIL.replace(':id', board.boardId.toString())}`,
        )
      }
      className="p-4 bg-white rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-xl">{BOARD_TYPE_ICONS[boardType] || '📝'}</span>
          <span className="text-sm text-gray-500">
            {BOARD_TYPE_LABELS[boardType] || '기타 문의'}
          </span>
        </div>
        <span
          className={`px-2 py-1 text-sm rounded-full ${
            board.answered
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {board.answered ? '답변완료' : '답변대기'}
        </span>
      </div>
      <h2 className="text-lg font-semibold mb-2">{board.title}</h2>
      <p className="text-gray-600 line-clamp-2">{board.content}</p>
    </div>
  );
}
