import { useState, useEffect, useCallback } from 'react';
import { boardApi } from '@/apis/board';
import { useToast } from '../useToast';
import type {
  BoardCreateRequest,
  BoardResponse,
  BoardDetailResponse,
  BoardUpdateRequest,
} from '@/types/board';

export const useBoard = () => {
  const [boards, setBoards] = useState<BoardResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // 게시글 목록 조회
  const fetchBoards = useCallback(async () => {
    try {
      setLoading(true);
      const data = await boardApi.getBoardList();
      setBoards(data);
    } catch (error: any) {
      showToast(
        error.message || '게시글 목록을 불러오는데 실패했습니다.',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // 게시글 상세 조회
  const fetchBoardDetail = useCallback(
    async (boardId: number): Promise<BoardDetailResponse | null> => {
      try {
        setLoading(true);
        const data = await boardApi.getBoard(boardId);
        return data;
      } catch (error: any) {
        showToast(
          error.message || '게시글을 불러오는데 실패했습니다.',
          'error',
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  // 게시글 작성
  const createBoard = useCallback(
    async (data: BoardCreateRequest) => {
      try {
        setLoading(true);
        const result = await boardApi.createBoard(data);

        // 목록 새로고침
        await fetchBoards();
        showToast('게시글이 등록되었습니다.', 'success');

        return { success: true, data: result };
      } catch (error: any) {
        showToast(error.message || '게시글 등록에 실패했습니다.', 'error');
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchBoards, showToast],
  );

  // 게시글 수정
  const updateBoard = useCallback(
    async (boardId: number, data: BoardUpdateRequest) => {
      try {
        setLoading(true);
        const result = await boardApi.updateBoard(boardId, data);

        // 목록 새로고침
        await fetchBoards();
        showToast('게시글이 수정되었습니다.', 'success');

        return { success: true, data: result };
      } catch (error: any) {
        showToast(error.message || '게시글 수정에 실패했습니다.', 'error');
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchBoards, showToast],
  );

  // 게시글 삭제
  const deleteBoard = useCallback(
    async (boardId: number) => {
      try {
        setLoading(true);
        await boardApi.deleteBoard(boardId);

        // 목록 새로고침
        await fetchBoards();
        return { success: true };
      } catch (error: any) {
        showToast(error.message || '게시글 삭제에 실패했습니다.', 'error');
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchBoards, showToast],
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
