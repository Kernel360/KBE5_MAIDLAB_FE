import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { useBoard } from '@/hooks/domain/useBoard';
import { ROUTES } from '@/constants/route';
import type { BoardResponse } from '@/types/board';
import BoardItem from '@/components/features/board/BoardItem';
import { BottomNavigation, ManagerFooter } from '@/components/layout/BottomNavigation/BottomNavigation';
import { useAuth } from '@/hooks';
import { usePagination } from '@/hooks';

export default function BoardList() {
  const navigate = useNavigate();
  const { boards, loading: isLoading, fetchBoards } = useBoard();
  const { isAuthenticated, userType } = useAuth();

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleBack = () => {
    navigate(ROUTES.HOME);
  };

  const handleCreate = () => {
    navigate(ROUTES.BOARD.CREATE);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // 페이지네이션 적용 (5개씩)
  const {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    hasNext,
    hasPrevious,
    goToPage,
    goToNext,
    goToPrevious,
  } = usePagination({ totalItems: boards.length, itemsPerPage: 5 });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-500">로딩중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">상담 게시판</h1>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-20">
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
                {boards.slice(startIndex, endIndex).map((board: BoardResponse) => (
                  <BoardItem
                    key={board.boardId}
                    board={board}
                    index={board.boardId}
                  />
                ))}
              </div>
              {/* 페이지네이션 UI */}
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={goToPrevious}
                  disabled={!hasPrevious}
                  className="px-3 py-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-50"
                >
                  이전
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i)}
                    className={`px-3 py-1 rounded font-medium ${currentPage === i ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={goToNext}
                  disabled={!hasNext}
                  className="px-3 py-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-50"
                >
                  다음
                </button>
              </div>
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

      {/* Footer */}
      {userType === 'MANAGER' ? (
        <ManagerFooter />
      ) : (
        <BottomNavigation
          activeTab="consultation"
          onTabClick={handleNavigation}
          isAuthenticated={isAuthenticated}
        />
      )}
    </div>
  );
}
