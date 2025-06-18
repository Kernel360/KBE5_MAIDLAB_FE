import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBoard } from '@/hooks/domain/useBoard';
import { ROUTES } from '@/constants/route';
import type { BoardResponseDto } from '@/apis/board';
import BoardHeader from '@/components/features/board/BoardHeader';
import BoardItem from '@/components/features/board/BoardItem';

export default function BoardList() {
  const navigate = useNavigate();
  const { boards, loading: isLoading, fetchBoards } = useBoard();

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">로딩중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <BoardHeader
        title="상담 게시판"
        onBackClick={() => navigate(ROUTES.HOME)}
      />

      {boards.length > 0 ? (
        <div className="space-y-4">
          {boards.map((board: BoardResponseDto) => (
            <BoardItem
              key={board.boardId}
              board={board}
              index={board.boardId}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">등록된 문의가 없습니다.</p>
          <button
            onClick={() => navigate(ROUTES.BOARD.CREATE)}
            className="mt-4 px-4 py-2 text-blue-500 hover:text-blue-600"
          >
            첫 문의 작성하기
          </button>
        </div>
      )}
    </div>
  );
}
