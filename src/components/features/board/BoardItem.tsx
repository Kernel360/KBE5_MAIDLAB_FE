import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/route';
import {
  BOARD_TYPE_LABELS,
  BOARD_TYPE_ICONS,
  BOARD_TYPES,
} from '@/constants/board';
import type { BoardResponse } from '@/types/domain/board';
import type { BoardType } from '@/constants/board';
import { useState } from 'react';

interface BoardItemProps {
  board: BoardResponse;
  index: number;
}

export default function BoardItem({ board }: BoardItemProps) {
  const navigate = useNavigate();
  const [openAnswer, setOpenAnswer] = useState(false);

  // ✅ 더 안전한 타입 체크
  const isValidBoardType = (type: string): type is BoardType => {
    return Object.values(BOARD_TYPES).includes(type as BoardType);
  };

  const boardType = isValidBoardType(board.boardType)
    ? board.boardType
    : BOARD_TYPES.ETC; // 기본값

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return '오늘';
    } else if (diffDays === 2) {
      return '어제';
    } else if (diffDays <= 7) {
      return `${diffDays - 1}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <div
      onClick={() =>
        navigate(
          `${ROUTES.BOARD.DETAIL.replace(':id', board.boardId.toString())}`,
        )
      }
      className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-xl">{BOARD_TYPE_ICONS[boardType] || '📝'}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {BOARD_TYPE_LABELS[boardType] || '기타 문의'}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {formatDate(board.createdAt)}
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
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-left">
        {board.title.length > 20
          ? `${board.title.slice(0, 20)}...`
          : board.title}
      </h2>
      <p className="text-gray-600 dark:text-gray-300 line-clamp-2 text-left">{board.content}</p>
      {/* 답변 토글 */}
      {board.answerContent && (
        <div className="mt-3">
          <button
            type="button"
            className="text-green-700 text-sm font-semibold underline hover:text-green-800 mb-2"
            onClick={(e) => {
              e.stopPropagation();
              setOpenAnswer((v) => !v);
            }}
          >
            {openAnswer ? '답변 닫기' : '답변 보기'}
          </button>
          {openAnswer && (
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded text-sm text-gray-700 dark:text-gray-300">
              <div className="mb-1 flex items-center gap-2">
                <span className="font-semibold text-green-700">답변</span>
                {board.answerCreatedAt && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(board.answerCreatedAt)}
                  </span>
                )}
              </div>
              <div className="whitespace-pre-line">{board.answerContent}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
