import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { useBoard } from '@/hooks/domain/useBoard';
import { ROUTES } from '@/constants/route';
import type { BoardResponse } from '@/types/domain/board';
import BoardItem from '@/components/features/board/BoardItem';
import { usePagination } from '@/hooks';
import { Header } from '@/components/layout/Header/Header';
import Pagination from '@/components/common/Pagination';

export default function BoardList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { boards, loading: isLoading, fetchBoards } = useBoard();

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  useEffect(() => {
    if (location.state && location.state.toast) {
      const { message, type } = location.state.toast;
      showToast(message, type);
      // 히스토리 state 초기화 (중복 방지)
      window.history.replaceState({}, document.title);
    }
  }, [location.state, showToast]);

  const handleCreate = () => {
    navigate(ROUTES.BOARD.CREATE);
  };

  // 페이지네이션 적용 (5개씩)
  const { currentPage, totalPages, startIndex, endIndex, goToPage } =
    usePagination({ totalItems: boards.length, itemsPerPage: 5 });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-500">로딩중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        variant="sub"
        title="상담 게시판"
        backRoute={ROUTES.HOME}
        showMenu={true}
      />
      {/* Content */}
      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          {boards.length > 0 ? (
            <>
              <div className="mb-4">
                <button
                  onClick={handleCreate}
                  className="w-full py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  새 문의 작성하기
                </button>
              </div>
              <div className="space-y-4">
                {boards
                  .slice(startIndex, endIndex)
                  .map((board: BoardResponse) => (
                    <BoardItem
                      key={board.boardId}
                      board={board}
                      index={board.boardId}
                    />
                  ))}
              </div>
              {/* 페이지네이션 */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                loading={isLoading}
              />
            </>
          ) : (
            /* 빈 상태 */
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div className="mb-4">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                아직 문의가 없습니다
              </h2>
              <p className="text-gray-500 mb-6">
                궁금한 점이 있으시면
                <br />
                언제든 문의해 주세요!
              </p>
              <button
                onClick={handleCreate}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                첫 문의 작성하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
