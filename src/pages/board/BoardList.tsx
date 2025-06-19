import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useBoard } from '@/hooks/domain/useBoard';
import { ROUTES } from '@/constants/route';
import type { BoardResponse } from '@/types/board';
import BoardItem from '@/components/features/board/BoardItem';
import { BottomNavigation, ManagerFooter } from '@/components/layout/BottomNavigation/BottomNavigation';
import { useAuth } from '@/hooks';

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
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF8533] transition-colors text-sm"
        >
          문의하기
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-20">
        <div className="max-w-md mx-auto">
          {boards.length > 0 ? (
            <div className="space-y-4">
              {boards.map((board: BoardResponse) => (
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
                onClick={handleCreate}
                className="mt-4 px-4 py-2 text-blue-500 hover:text-blue-600"
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
