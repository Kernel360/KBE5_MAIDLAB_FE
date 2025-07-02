import { useState, useEffect } from 'react';
import { useAdmin } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { BOARD_TYPE_NAMES, DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NUMBER } from '@/constants/admin';
import type { BoardListResponse } from '@/types/board';

const ManagerBoard = () => {
  const navigate = useNavigate();
  
  const [page, setPage] = useState(DEFAULT_PAGE_NUMBER);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const { boardManagement } = useAdmin();
  
  const [boardData, setBoardData] = useState<BoardListResponse>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: DEFAULT_PAGE_SIZE,
    number: DEFAULT_PAGE_NUMBER,
    numberOfElements: 0,
    first: true,
    last: false,
    empty: true,
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(DEFAULT_PAGE_NUMBER);
  };

  const fetchConsultationBoards = async () => {
    try {
      setLoading(true);
      const response = await boardManagement.fetchConsultationBoards({
        page,
        size: rowsPerPage,
      });
      if (response) {
        // Handle case where API returns array directly instead of paginated response
        if (Array.isArray(response)) {
          setBoardData({
            content: response,
            totalElements: response.length,
            totalPages: Math.ceil(response.length / rowsPerPage),
            size: rowsPerPage,
            number: page,
            numberOfElements: response.length,
            first: page === 0,
            last: Math.ceil(response.length / rowsPerPage) <= page + 1,
            empty: response.length === 0,
          });
        } else {
          setBoardData(response);
        }
      }
    } catch (error) {
      console.error('Failed to fetch consultation boards:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultationBoards();
  }, [page, rowsPerPage]);

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
                <td colSpan={5} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                  </div>
                </td>
              </tr>
            ) : boardData.content && boardData.content.length > 0 ? (
              boardData.content.map((board, index) => (
                <tr 
                  key={index}
                  onClick={() => handleViewDetail(board.boardId)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(board.boardType)}`}>
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
                    {board.createdAt.split('T')[0] + ' ' + board.createdAt.split('T')[1].split('.')[0]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(board.answered)}`}>
                      {board.answered ? '답변 완료' : '답변 대기'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  매니저 상담 문의가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between items-center">
          <div className="flex items-center">
            <label htmlFor="rows-per-page" className="mr-2 text-sm text-gray-700">
              페이지당 행 수:
            </label>
            <select
              id="rows-per-page"
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, boardData.totalElements || 0)} of {boardData.totalElements || 0}
            </span>
            <button
              onClick={() => handleChangePage(null, page - 1)}
              disabled={page === 0}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <button
              onClick={() => handleChangePage(null, page + 1)}
              disabled={page >= (boardData.totalPages || 1) - 1}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerBoard;