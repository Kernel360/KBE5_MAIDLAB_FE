import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdmin } from '@/hooks';
import { ROUTES } from '@/constants';
import { BOARD_TYPE_NAMES, BOARD_TYPE_COLORS } from '@/constants/admin';
import type { BoardDetailResponse } from '@/types/board';

// Admin-friendly color scheme matching the admin layout
const chipColors = {
  primary: 'bg-blue-100 text-blue-800 border-blue-200',
  secondary: 'bg-purple-100 text-purple-800 border-purple-200',
  default: 'bg-gray-100 text-gray-800 border-gray-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  info: 'bg-cyan-100 text-cyan-800 border-cyan-200',
};

const BoardDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { boardManagement } = useAdmin();
  const [board, setBoard] = useState<BoardDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 게시글 상세 정보 조회
  useEffect(() => {
    const fetchBoardDetail = async () => {
      if (!id) return;
      try {
        const data = await boardManagement.fetchBoardDetail(Number(id));
        if (data) {
          setBoard(data);
          if (data.answer) {
            setAnswer(data.answer.content);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching board detail:', error);
        setLoading(false);
      }
    };

    if (loading) {
      fetchBoardDetail();
    }
  }, [id, boardManagement, loading]);

  // 목록으로 돌아가기
  const handleBack = () => {
    navigate(-1);
  };

  // 이미지 모달 열기
  const handleImageClick = (imagePath: string) => {
    setSelectedImage(imagePath);
  };

  // 이미지 모달 닫기
  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  // 답변 등록/수정
  const handleSubmitAnswer = async () => {
    if (!id || !answer.trim()) return;
    setSubmitting(true);

    try {
      let result;
      if (isEditing && board?.answer) {
        // 답변 수정
        result = await boardManagement.updateAnswer(Number(id), {
          content: answer.trim(),
        });
      } else {
        // 답변 등록
        result = await boardManagement.createAnswer(Number(id), {
          content: answer.trim(),
        });
      }

      if (result.success) {
        // 답변 등록/수정 후 게시글 정보 새로고침
        const data = await boardManagement.fetchBoardDetail(Number(id));
        if (data) {
          setBoard(data);
          setIsEditing(false);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 답변 수정 취소
  const handleCancelEdit = () => {
    if (board?.answer) {
      setAnswer(board.answer.content);
    }
    setIsEditing(false);
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 작성자 정보 구분 함수
  const getAuthorInfo = () => {
    if (board?.consumerName) {
      return {
        name: board.consumerName,
        type: '사용자',
        color: 'primary' as const,
      };
    } else if (board?.managerName) {
      return {
        name: board.managerName,
        type: '매니저',
        color: 'secondary' as const,
      };
    }
    return {
      name: '익명',
      type: '',
      color: 'default' as const,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-500 rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">게시글을 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.767 0L3.132 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h2 className="text-xl font-semibold text-red-600 mb-2">
                게시글을 찾을 수 없습니다.
              </h2>
              <p className="text-red-500">요청하신 게시글이 존재하지 않거나 삭제되었습니다.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        {/* Admin Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">게시글 상세</h1>
            <p className="text-gray-600 mt-1">게시글 ID: {id}</p>
          </div>
          <button
            onClick={handleBack}
            className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            목록으로
          </button>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8">
            {/* Board Type Badge */}
            <div className="mb-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${chipColors[BOARD_TYPE_COLORS[board.boardType]] || chipColors.default}`}>
                {BOARD_TYPE_NAMES[board.boardType]}
              </span>
            </div>

            {/* Title and Meta Information */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {board.title}
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <span className="text-gray-500 font-medium w-20">작성자:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {getAuthorInfo().name}
                      </span>
                      {getAuthorInfo().type && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${chipColors[getAuthorInfo().color]}`}>
                          {getAuthorInfo().type}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 font-medium w-20">작성일:</span>
                    <span className="text-gray-900">
                      {board.createdAt ? formatDate(board.createdAt) : '날짜 정보 없음'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                문의 내용
              </h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {board.content}
                </p>
              </div>
            </div>

            {/* Attached Images */}
            {board.images && board.images.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  첨부 이미지 ({board.images.length}개)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {board.images.map((image, index) => (
                    <div
                      key={index}
                      className="group cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 bg-white"
                      onClick={() => handleImageClick(image.imagePath)}
                    >
                      <div className="aspect-video bg-gray-50 flex items-center justify-center overflow-hidden">
                        <img
                          src={image.imagePath}
                          alt={image.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-sm text-gray-600 truncate">{image.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Answer Section */}
            <div className="border-t border-gray-200 pt-8">
              {board.answer && !isEditing ? (
                // Existing Answer Display
                <>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      관리자 답변
                    </h3>
                    <button
                      onClick={() =>
                        navigate(
                          `${ROUTES.ADMIN.BOARD_EDIT.replace(':id', id || '')}`,
                        )
                      }
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                    >
                      답변 수정
                    </button>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {board.answer.content}
                    </p>
                  </div>
                </>
              ) : (
                // Answer Input Form
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    {isEditing ? '답변 수정' : '답변 작성'}
                  </h3>
                  <div className="space-y-4">
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="고객님께 전달할 답변을 입력해주세요..."
                      disabled={submitting}
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={!answer.trim() || submitting}
                        className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            처리중...
                          </>
                        ) : isEditing ? (
                          '답변 수정'
                        ) : (
                          '답변 등록'
                        )}
                      </button>
                      {isEditing && (
                        <button
                          onClick={handleCancelEdit}
                          className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                        >
                          취소
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">이미지 확대보기</h3>
              <button
                onClick={handleCloseImage}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
              <img
                src={selectedImage}
                alt="확대된 이미지"
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleCloseImage}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardDetail;