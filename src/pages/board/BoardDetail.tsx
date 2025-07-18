import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useBoard } from '@/hooks/domain/useBoard';
import { ROUTES } from '@/constants/route';
import { BOARD_TYPE_LABELS } from '@/constants/board';
import type { BoardDetailResponse, ImageInfo } from '@/types/domain/board';
import AnswerSection from '@/components/features/board/AnswerSection';
import { Header } from '@/components/layout/Header/Header';

// 이미지 모달 컴포넌트
const ImageModal = ({
  image,
  onClose,
}: {
  image: ImageInfo;
  onClose: () => void;
}) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          ✕
        </button>
        <img
          src={image.imagePath}
          alt={image.name}
          className="w-full h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

// 삭제 확인 팝업 컴포넌트
const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          게시글 삭제
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          정말로 이 게시글을 삭제하시겠습니까?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

export default function BoardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { fetchBoardDetail, deleteBoard } = useBoard();
  const [board, setBoard] = useState<BoardDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageInfo | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

  useEffect(() => {
    if (deleted || isDeleting) return; // 삭제 중/삭제 후에는 fetchBoardDetail 실행 안 함
    let isComponentMounted = true;

    const loadBoard = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await fetchBoardDetail(parseInt(id));

        if (!isComponentMounted || deleted || isDeleting) return;

        if (data) {
          setBoard(data);
        } else {
          showToast('게시글을 찾을 수 없습니다.', 'error');
          setTimeout(() => {
            if (isComponentMounted && !deleted && !isDeleting) {
              navigate(ROUTES.BOARD.LIST);
            }
          }, 1000);
        }
      } catch (error: any) {
        if (isComponentMounted && !deleted && !isDeleting) {
          showToast(
            error.message || '게시글을 불러오는데 실패했습니다.',
            'error',
          );
          setTimeout(() => {
            if (isComponentMounted && !deleted && !isDeleting) {
              navigate(ROUTES.BOARD.LIST);
            }
          }, 1000);
        }
      } finally {
        if (isComponentMounted && !deleted && !isDeleting) {
          setIsLoading(false);
        }
      }
    };

    loadBoard();

    return () => {
      isComponentMounted = false;
    };
  }, [id, navigate, showToast, fetchBoardDetail, deleted, isDeleting]);

  const handleDelete = async () => {
    if (!id) return;

    try {
      setIsDeleting(true);
      const result = await deleteBoard(parseInt(id));
      if (result.success) {
        setDeleted(true);
        navigate(ROUTES.BOARD.LIST, {
          replace: true,
          state: {
            toast: { message: '게시글이 삭제되었습니다.', type: 'success' },
          },
        });
        return;
      } else {
        throw new Error('게시글 삭제에 실패했습니다.');
      }
    } catch (error: any) {
      showToast(error.message || '게시글 삭제에 실패했습니다.', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (deleted) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!board) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        variant="sub"
        title="문의 상세"
        backRoute={ROUTES.BOARD.LIST}
        showMenu={false}
      />
      {/* Content */}
      <main className="px-4 py-6 pb-20">
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="space-y-4">
              {/* 게시글 타입과 답변 상태 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {BOARD_TYPE_LABELS[board.boardType]}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {formatDate(board.createdAt)}
                  </span>
                  {board.answered ? (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full whitespace-nowrap">
                      답변완료
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full whitespace-nowrap">
                      답변대기
                    </span>
                  )}
                </div>
                {board && (
                  <div className="flex gap-1 sm:gap-2 min-w-0">
                    <button
                      onClick={() => {
                        if (id) {
                          navigate(`${ROUTES.BOARD.EDIT.replace(':id', id)}`);
                        }
                      }}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent whitespace-nowrap flex-shrink-0 overflow-hidden"
                      disabled={isDeleting}
                    >
                      <Edit className="w-4 h-4 mr-1.5 flex-shrink-0" />
                      수정
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="w-10 h-10 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isDeleting}
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </button>
                  </div>
                )}
              </div>

              {/* 제목 */}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white break-words text-left">
                {board.title}
              </h1>

              {/* 내용 */}
              <div className="text-gray-900 dark:text-white text-base break-words">
                {board.content}
              </div>
            </div>
          </div>

          {/* 이미지 갤러리 */}
          {board.images && board.images.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                첨부 이미지
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {board.images.map((image: ImageInfo, index: number) => (
                  <div
                    key={index}
                    className="aspect-square relative group cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image.imagePath}
                      alt={image.name}
                      className="w-full h-full object-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 답변 섹션 */}
          <AnswerSection
            answer={board.answer?.content}
            answerCreatedAt={board.answer?.createdAt}
          />

          {/* 이미지 모달 */}
          {selectedImage && (
            <ImageModal
              image={selectedImage}
              onClose={() => setSelectedImage(null)}
            />
          )}

          {/* 삭제 확인 모달 */}
          <DeleteConfirmModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDelete}
          />
        </div>
      </main>
    </div>
  );
}
