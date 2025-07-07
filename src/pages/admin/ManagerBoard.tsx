import { useState, useEffect } from 'react';
import { useAdmin } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { BOARD_TYPE_NAMES } from '@/constants/admin';
import type { BoardResponse, BoardWithId } from '@/types/board';

const ManagerBoard = () => {
  const [boards, setBoards] = useState<BoardWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { boardManagement } = useAdmin();

  // 매니저 상담 게시글 목록 조회
  const fetchConsultationBoards = async () => {
    setLoading(true);
    try {
      const data: BoardResponse[] =
        await boardManagement.fetchConsultationBoards();
      setBoards(data as BoardWithId[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultationBoards();
  }, []);

  // 게시글 상세 페이지로 이동
  const handleViewDetail = (boardId: number) => {
    navigate(`${ROUTES.ADMIN.BOARD_DETAIL.replace(':id', boardId.toString())}`);
  };

  // 게시글 유형 배지 색상
  const getTypeBadgeColor = (boardType: string) => {
    switch (boardType) {
      case 'CONSULTATION':
        return 'bg-blue-100 text-blue-800';
      case 'REFUND':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 답변 상태 배지 색상
  const getStatusBadgeColor = (answered: boolean) => {
    return answered
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          매니저 상담 문의 목록
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                유형
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                제목
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작성자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작성일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                답변 상태
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  </div>
                </td>
              </tr>
            ) : boards.length > 0 ? (
              boards.map((board, index) => (
                <tr
                  key={index}
                  onClick={() => handleViewDetail(board.boardId)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(board.boardType)}`}
                    >
                      {BOARD_TYPE_NAMES[board.boardType]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {board.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {board.managerName || '익명'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {board.createdAt.split('T')[0] +
                      ' ' +
                      board.createdAt.split('T')[1].split('.')[0]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(board.answered)}`}
                    >
                      {board.answered ? '답변 완료' : '답변 대기'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  매니저 상담 문의가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagerBoard;
