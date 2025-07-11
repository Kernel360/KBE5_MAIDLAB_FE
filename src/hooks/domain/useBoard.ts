import { useState, useEffect, useCallback } from 'react';
import { boardApi } from '@/apis/board';
import { useApiCall } from '../useApiCall';
import type {
  BoardCreateRequest,
  BoardResponse,
  BoardDetailResponse,
  BoardUpdateRequest,
} from '@/types/domain/board';

export const useBoard = () => {
  const [boards, setBoards] = useState<BoardResponse[]>([]);
  const { executeApi, loading } = useApiCall();

  // 게시글 목록 조회
  const fetchBoards = useCallback(async () => {
    const result = await executeApi(() => boardApi.getBoardList(), {
      successMessage: null, // 목록 조회는 토스트 메시지 없음
      errorMessage: '게시글 목록을 불러오는데 실패했습니다.',
    });

    if (result.success) {
      setBoards(result.data || []);
    }

    return result;
  }, [executeApi]);

  // 게시글 상세 조회
  const fetchBoardDetail = useCallback(
    async (boardId: number): Promise<BoardDetailResponse | null> => {
      const result = await executeApi(() => boardApi.getBoard(boardId), {
        successMessage: null,
        errorMessage: '게시글을 불러오는데 실패했습니다.',
      });

      return result.success ? (result.data ?? null) : null;
    },
    [executeApi],
  );

  // 게시글 작성
  const createBoard = useCallback(
    async (data: BoardCreateRequest) => {
      const result = await executeApi(() => boardApi.createBoard(data), {
        successMessage: '게시글이 등록되었습니다.',
        errorMessage: '게시글 등록에 실패했습니다.',
      });

      if (result.success) {
        await fetchBoards(); // 목록 새로고침
      }

      return result;
    },
    [executeApi, fetchBoards],
  );

  // 게시글 수정
  const updateBoard = useCallback(
    async (boardId: number, data: BoardUpdateRequest) => {
      const result = await executeApi(
        () => boardApi.updateBoard(boardId, data),
        {
          successMessage: '게시글이 수정되었습니다.',
          errorMessage: '게시글 수정에 실패했습니다.',
        },
      );

      if (result.success) {
        await fetchBoards(); // 목록 새로고침
      }

      return result;
    },
    [executeApi, fetchBoards],
  );

  // 게시글 삭제
  const deleteBoard = useCallback(
    async (boardId: number) => {
      const result = await executeApi(() => boardApi.deleteBoard(boardId), {
        successMessage: '게시글이 삭제되었습니다.',
        errorMessage: '게시글 삭제에 실패했습니다.',
      });

      if (result.success) {
        await fetchBoards(); // 목록 새로고침
      }

      return result;
    },
    [executeApi, fetchBoards],
  );

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  return {
    boards,
    loading,
    fetchBoards,
    fetchBoardDetail,
    createBoard,
    updateBoard,
    deleteBoard,
  };
};
