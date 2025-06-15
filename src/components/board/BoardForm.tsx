import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { useBoard } from '@/hooks/useBoard';
import { ROUTES } from '@/constants/route';
import { BOARD_TYPES } from '@/constants/board';
import type { BoardType } from '@/constants/board';
import type { ImageDto, BoardRequestDto } from '@/apis/board';
import BoardHeader from '@/components/board/BoardHeader';
import BoardTypeSelector from '@/components/board/BoardTypeSelector';
import ImageUploader from '@/components/board/ImageUploader';

interface BoardFormProps {
  mode: 'create' | 'edit';
  boardId?: number;
  initialData?: {
    boardType: BoardType;
    title: string;
    content: string;
    images: ImageDto[];
  };
  onSuccess?: () => void;
}

export default function BoardForm({ mode, boardId, initialData, onSuccess }: BoardFormProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { createBoard, updateBoard, fetchBoardDetail } = useBoard();
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [boardType, setBoardType] = useState<BoardType>(initialData?.boardType || BOARD_TYPES.ETC);
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<ImageDto[]>(initialData?.images || []);

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
        showToast(error.message || '게시글을 불러오는데 실패했습니다.', 'error');
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

      // 이미지 업로드 및 ImageDto 생성
      const imageDtos: ImageDto[] = await Promise.all(
        images.map(async (file) => {
          // TODO: 실제 이미지 업로드 API 구현 필요
          // 임시로 로컬 URL을 사용
          const imagePath = URL.createObjectURL(file);
          return { imagePath, name: file.name };
        })
      );

      const boardData: BoardRequestDto = {
        boardType,
        title: title.trim(),
        content: content.trim(),
        images: [...existingImages, ...imageDtos],
      };

      if (mode === 'create') {
        const result = await createBoard(boardData);
        if (result.success) {
          showToast('게시글이 등록되었습니다.', 'success');
          if (onSuccess) {
            onSuccess();
          } else {
            navigate(ROUTES.BOARD.LIST);
          }
        }
      } else if (mode === 'edit' && boardId) {
        const result = await updateBoard(boardId, boardData);
        if (result.success) {
          showToast('게시글이 수정되었습니다.', 'success');
          if (onSuccess) {
            onSuccess();
          } else {
            navigate(`/board/${boardId}`);
          }
        }
      }
    } catch (error: any) {
      showToast(error.message || `게시글 ${mode === 'create' ? '등록' : '수정'}에 실패했습니다.`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <BoardHeader
        title={`문의 ${mode === 'create' ? '작성' : '수정'}`}
        showCreateButton={false}
        onBackClick={() => {
          if (mode === 'create') {
            navigate(ROUTES.BOARD.LIST);
          } else if (mode === 'edit' && boardId) {
            navigate(`/board/${boardId}`);
          }
        }}
      />

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
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left"
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
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left"
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
            onClick={() => {
              if (mode === 'create') {
                navigate(ROUTES.BOARD.LIST);
              } else if (mode === 'edit' && boardId) {
                navigate(`/board/${boardId}`);
              }
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isSubmitting}
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? `${mode === 'create' ? '등록' : '수정'} 중...`
              : `${mode === 'create' ? '등록' : '수정'}하기`}
          </button>
        </div>
      </form>
    </div>
  );
} 