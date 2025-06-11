import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { ROUTES } from '@/constants/route';
import { BOARD_TYPES } from '@/constants/board';
import type { BoardType } from '@/constants/board';
import type { ImageDto } from '@/apis/admin';
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
        // TODO: 서버 통신 구현 후 주석 해제
        // const board = await boardApi.getBoard(boardId);
        // setBoardType(board.boardType);
        // setTitle(board.title);
        // setContent(board.content);
        // setExistingImages(board.images);

        // 하드코딩된 데이터로 테스트
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const mockBoard = {
          boardType: BOARD_TYPES.REFUND,
          title: '환불 문의드립니다',
          content: '서비스 이용 중 문제가 발생하여 환불을 요청드립니다.',
          images: [
            { imagePath: 'https://picsum.photos/400/300', name: 'image1.jpg' },
            { imagePath: 'https://picsum.photos/400/301', name: 'image2.jpg' },
          ],
        };
        setBoardType(mockBoard.boardType);
        setTitle(mockBoard.title);
        setContent(mockBoard.content);
        setExistingImages(mockBoard.images);
      } catch (error: any) {
        showToast(error.message || '게시글을 불러오는데 실패했습니다.', 'error');
        navigate(ROUTES.BOARD.LIST);
      } finally {
        setIsLoading(false);
      }
    };

    loadBoard();
  }, [mode, boardId, navigate, showToast]);

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

      // TODO: 서버 통신 구현 후 주석 해제
      // // 이미지 업로드 및 ImageDto 생성
      // const imageDtos: ImageDto[] = await Promise.all(
      //   images.map(async (file) => {
      //     // const response = await uploadImage(file);
      //     // return { imagePath: response.path, name: file.name };
      //     return { imagePath: URL.createObjectURL(file), name: file.name };
      //   })
      // );

      // if (mode === 'create') {
      //   await boardApi.createBoard({
      //     boardType,
      //     title,
      //     content,
      //     images: imageDtos,
      //   });
      // } else if (mode === 'edit' && boardId) {
      //   await boardApi.updateBoard(boardId, {
      //     boardType,
      //     title,
      //     content,
      //     images: [...existingImages, ...imageDtos],
      //   });
      // }

      // 하드코딩된 응답 처리
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`${mode === 'create' ? '게시글 생성' : '게시글 수정'} 요청:`, {
        boardId,
        boardType,
        title,
        content,
        images: [
          ...existingImages,
          ...images.map(file => ({ name: file.name, size: file.size })),
        ],
      });

      showToast(`게시글이 ${mode === 'create' ? '등록' : '수정'}되었습니다.`, 'success');
      if (onSuccess) {
        onSuccess();
      } else if (mode === 'create') {
        navigate(ROUTES.BOARD.LIST);
      } else if (mode === 'edit' && boardId) {
        navigate(`/board/${boardId}`);
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
        <BoardTypeSelector
          selectedType={boardType}
          onTypeChange={setBoardType}
        />

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            제목
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="제목을 입력해주세요"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            내용
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="문의 내용을 입력해주세요"
          />
        </div>

        <ImageUploader
          images={images}
          previewUrls={previewUrls}
          onImagesChange={setImages}
          onPreviewUrlsChange={setPreviewUrls}
          existingImages={existingImages}
          onExistingImagesChange={setExistingImages}
        />

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