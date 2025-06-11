import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { boardApi } from '@/apis/board';
import { ROUTES } from '@/constants/route';
import { BOARD_TYPES } from '@/constants/board';
import type { ConsumerBoardResponseDto } from '@/apis/board';
import BoardHeader from '@/components/board/BoardHeader';
import BoardItem from '@/components/board/BoardItem';

// 하드코딩된 게시글 목록 데이터
const MOCK_BOARDS: ConsumerBoardResponseDto[] = [
  {
    boardId: 1,
    boardType: BOARD_TYPES.REFUND,
    title: '환불 요청드립니다',
    content: '서비스 이용 중 문제가 발생하여 환불을 요청드립니다. 자세한 내용은 다음과 같습니다...',
    answered: true,
    // createdAt: '2024-03-15T10:00:00',
  },
  {
    boardId: 2,
    boardType: BOARD_TYPES.MANAGER,
    title: '매니저 서비스 문의',
    content: '매니저 서비스 이용 중 궁금한 점이 있어 문의드립니다. 매니저 변경이 가능한가요?',
    answered: false,
    // createdAt: '2024-03-16T14:30:00',
  },
  {
    boardId: 3,
    boardType: BOARD_TYPES.SERVICE,
    title: '서비스 이용 방법 문의',
    content: '서비스 이용 방법에 대해 자세히 알고 싶습니다. 예약은 어떻게 하나요?',
    answered: true,
    // createdAt: '2024-03-17T09:15:00',
  },
  {
    boardId: 4,
    boardType: BOARD_TYPES.ETC,
    title: '기타 문의사항',
    content: '서비스 이용 중 다른 궁금한 점이 있어 문의드립니다.',
    answered: false,
    // createdAt: '2024-03-18T16:45:00',
  },
];

export default function BoardList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [boards, setBoards] = useState<ConsumerBoardResponseDto[]>([]);

  useEffect(() => {
    const loadBoards = async () => {
      try {
        setIsLoading(true);
        // TODO: 서버 통신 구현 후 주석 해제
        // const data = await boardApi.getBoardList();
        // setBoards(data);
        
        // 하드코딩된 데이터 사용
        setTimeout(() => {
          setBoards(MOCK_BOARDS);
          setIsLoading(false);
        }, 500); // 로딩 상태 확인을 위한 지연
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '게시글 목록을 불러오는데 실패했습니다.';
        showToast(errorMessage, 'error');
        setIsLoading(false);
      }
    };

    loadBoards();
  }, [showToast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">로딩중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <BoardHeader title="문의 게시판" />

      {boards.length > 0 ? (
        <div className="space-y-4">
          {boards.map((board: ConsumerBoardResponseDto) => (
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