import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useBoard } from '@/hooks/domain/useBoard';
import { ROUTES } from '@/constants/route';
import { BOARD_TYPES } from '@/constants/board';
import { uploadToS3 } from '@/utils/s3';
import type { BoardType } from '@/constants/board';
import type { ImageInfo, BoardCreateRequest } from '@/types/board';
import BoardTypeSelector from '@/components/features/board/BoardTypeSelector';
import ImageUploader from '@/components/features/board/ImageUploader';

interface BoardFormProps {
  mode: 'create' | 'edit';
  boardId?: number;
  initialData?: {
    boardType: BoardType;
    title: string;
    content: string;
    images: ImageInfo[];
  };
  onSuccess?: () => void;
}

export default function BoardForm({
  mode,
  boardId,
  initialData,
  onSuccess,
}: BoardFormProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { createBoard, updateBoard, fetchBoardDetail } = useBoard();
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [boardType, setBoardType] = useState<BoardType>(
    initialData?.boardType || BOARD_TYPES.ETC,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<ImageInfo[]>(
    initialData?.images || [],
  );

  useEffect(() => {
    const loadBoard = async () => {
      if (mode !== 'edit' || !boardId) return;

      try {
        setIsLoading(true);
        const board = await fetchBoardDetail(boardId);
        if (board) {
          setBoardType(board.boardType);
          setTitle(board.title);
          setContent(board.content);
          setExistingImages(board.images);
        }
      } catch (error: any) {
        showToast(
          error.message || '게시글을 불러오는데 실패했습니다.',
          'error',
        );
        navigate(ROUTES.BOARD.LIST);
      } finally {
        setIsLoading(false);
      }
    };

    loadBoard();
  }, [mode, boardId, navigate, showToast, fetchBoardDetail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('제목을 입력해주세요.', 'error');
      return;
    }

    if (!content.trim()) {
      showToast('내용을 입력해주세요.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      setIsUploading(true);

      // 이미지 S3 업로드 및 ImageDto 생성
      const imageDtos: ImageInfo[] = await Promise.all(
        images.map(async (file) => {
          try {
            const { url } = await uploadToS3(file);
            return { imagePath: url, name: file.name };
          } catch (error: any) {
            showToast(`이미지 "${file.name}" 업로드에 실패했습니다.`, 'error');
            throw error;
          }
        })
      );

      const boardData: BoardCreateRequest = {
        boardType,
        title: title.trim(),
        content: content.trim(),
        images: [...existingImages, ...imageDtos],
      };

      if (mode === 'create') {
        const result = await createBoard(boardData);
        if (result.success) {
          if (onSuccess) {
            onSuccess();
          } else {
            navigate(ROUTES.BOARD.LIST);
          }
        }
      } else if (mode === 'edit' && boardId) {
        const result = await updateBoard(boardId, boardData);
        if (result.success) {
          if (onSuccess) {
            onSuccess();
          } else {
            navigate(`/board/${boardId}`);
          }
        }
      }
    } catch (error: any) {
      showToast(
        error.message ||
          `게시글 ${mode === 'create' ? '등록' : '수정'}에 실패했습니다.`,
        'error',
      );
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    if (mode === 'create') {
      navigate(ROUTES.BOARD.LIST);
    } else if (mode === 'edit' && boardId) {
      navigate(`/board/${boardId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
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
        <h1 className="text-lg font-bold">{`문의 ${mode === 'create' ? '작성' : '수정'}`}</h1>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-left">
                <BoardTypeSelector
                  selectedType={boardType}
                  onTypeChange={setBoardType}
                />
              </div>

              <div className="text-left">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  제목 <span className="text-gray-500 text-xs">(최대 30자)</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => {
                    if (e.target.value.length <= 30) {
                      setTitle(e.target.value);
                    }
                  }}
                  maxLength={30}
                  className="form-input text-left"
                  placeholder="제목을 입력해주세요 (최대 30자)"
                />
                <div className="mt-1 text-right text-sm text-gray-500">
                  {title.length}/30
                </div>
              </div>

              <div className="text-left">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  내용 <span className="text-gray-500 text-xs">(최대 2000자)</span>
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => {
                    if (e.target.value.length <= 2000) {
                      setContent(e.target.value);
                    }
                  }}
                  maxLength={2000}
                  rows={6}
                  className="form-input text-left"
                  placeholder="문의 내용을 입력해주세요 (최대 2000자)"
                />
                <div className="mt-1 text-right text-sm text-gray-500">
                  {content.length}/2000
                </div>
              </div>

              <div className="text-left">
                <ImageUploader
                  images={images}
                  previewUrls={previewUrls}
                  onImagesChange={setImages}
                  onPreviewUrlsChange={setPreviewUrls}
                  existingImages={existingImages}
                  onExistingImagesChange={setExistingImages}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 text-[#FF6B00] hover:bg-[#FFF5EE] rounded-lg"
                  disabled={isSubmitting || isUploading}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF8533] disabled:bg-[#FFB380]"
                  disabled={isSubmitting || isUploading}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isUploading ? '이미지 업로드 중...' : '저장 중...'}
                    </span>
                  ) : (
                    '저장하기'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
