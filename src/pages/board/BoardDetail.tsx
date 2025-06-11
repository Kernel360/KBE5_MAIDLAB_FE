import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { ROUTES } from '@/constants/route';
import { BOARD_TYPES,  BOARD_TYPE_LABELS } from '@/constants/board';
import type { ConsumerBoardDetailResponseDto, ImageDto } from '@/apis/board';
import BoardHeader from '@/components/board/BoardHeader';
import AnswerSection from '@/components/board/AnswerSection';

// 하드코딩된 게시글  데이터
const MOCK_BOARD_DETAILS: ConsumerBoardDetailResponseDto[] = [
  {
    boardId: 1,
    boardType: BOARD_TYPES.REFUND,
    title: '환불 문의드립니다',
    content: '서비스 이용 중 문제가 발생하여 환불을 요청드립니다.',
    answered: true,
    images: [
      { imagePath: 'https://picsum.photos/400/300', name: 'image1.jpg' },
      { imagePath: 'https://picsum.photos/400/301', name: 'image2.jpg' },
    ],
    answer: {
      content: '안녕하세요. 환불 요청하신 내용 확인했습니다. 자세한 내용은 고객센터로 문의 부탁드립니다.',
      // createdAt: '2024-03-15T14:30:00',
    },
    // createdAt: '2024-03-15T10:00:00',
  },
  {
    boardId: 2,
    boardType: BOARD_TYPES.MANAGER,
    title: '매니저 추천 부탁드립니다',
    content: '강남 지역에서 활동하시는 매니저님 추천 부탁드립니다.',
    answered: false,
    images: [],
    // createdAt: '2024-03-14T15:20:00',
  },
//   {
//     boardId: 3,
//     boardType: BOARD_TYPES.SERVICE,
//     title: '서비스 이용 방법 문의',
//     content: '서비스 이용 방법에 대해 자세히 알고 싶습니다. 예약은 어떻게 하나요?',
//     answered: true,
//     images: [],
//     answer: {
//       content: '안녕하세요. 서비스 이용 방법에 대해 답변드립니다. 홈페이지의 예약하기 버튼을 통해 예약이 가능합니다. 자세한 내용은 이용가이드를 참고해주세요.',
//     },
//   },
  {
    boardId: 4,
    boardType: BOARD_TYPES.ETC,
    title: '기타 문의사항',
    content: '서비스 이용 중 다른 궁금한 점이 있어 문의드립니다.',
    answered: false,
    images: [],
  },
];

export default function BoardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [board, setBoard] = useState<ConsumerBoardDetailResponseDto | null>(null);

  useEffect(() => {
    let isComponentMounted = true; // 컴포넌트 마운트 상태 추적

    const loadBoard = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        // TODO: 서버 통신 구현 후 주석 해제
        // const data = await boardApi.getBoardDetail(parseInt(id));
        // setBoard(data);

        // 하드코딩된 데이터 사용
        setTimeout(() => {
          if (!isComponentMounted) return; // 컴포넌트가 언마운트되었다면 실행하지 않음

          const boardId = parseInt(id);
          const mockData = MOCK_BOARD_DETAILS.find(b => b.boardId === boardId);
          
          if (mockData) {
            setBoard(mockData);
          } else {
            showToast('게시글을 찾을 수 없습니다.', 'error');
            // 토스트 메시지가 표시된 후 목록 페이지로 이동
            setTimeout(() => {
              if (isComponentMounted) { // 컴포넌트가 여전히 마운트된 상태일 때만 이동
                navigate(ROUTES.BOARD.LIST);
              }
            }, 1000);
          }
          setIsLoading(false);
        }, 500);
      } catch (error: any) {
        if (isComponentMounted) { // 컴포넌트가 마운트된 상태일 때만 에러 처리
          showToast(error.message || '게시글을 불러오는데 실패했습니다.', 'error');
          setTimeout(() => {
            if (isComponentMounted) { // 컴포넌트가 여전히 마운트된 상태일 때만 이동
              navigate(ROUTES.BOARD.LIST);
            }
          }, 1000);
          setIsLoading(false);
        }
      }
    };

    loadBoard();

    // 클린업 함수
    return () => {
      isComponentMounted = false;
    };
  }, [id, navigate, showToast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!board) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <BoardHeader
        title="문의 상세"
        showCreateButton={false}
        onBackClick={() => navigate(ROUTES.BOARD.LIST)}
      />

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-500">
                  {BOARD_TYPE_LABELS[board.boardType]}
                </span>
                {board.answered && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    답변완료
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{board.title}</h1>
            </div>
            {board && (
              <button
                onClick={() => {
                  if (id) {
                    navigate(`${ROUTES.BOARD.EDIT.replace(':id', id)}`);
                  }
                }}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
              >
                수정
              </button>
            )}
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{board.content}</p>
        </div>

        {/* 이미지 갤러리 */}
        {board.images && board.images.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {board.images.map((image: ImageDto, index: number) => (
              <img
                key={index}
                src={image.imagePath}
                alt={image.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            ))}
          </div>
        )}

        {/* 답변 섹션 */}
        <AnswerSection answer={board.answer?.content} />
      </div>
    </div>
  );
} 