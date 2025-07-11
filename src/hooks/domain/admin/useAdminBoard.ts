import { useCallback } from 'react';
import { adminApi } from '@/apis/admin';
import { useApiCall } from '../../useApiCall';
import type { AdminPageParams, AdminAnswerRequest } from '@/types/domain/admin';

export const useAdminBoard = () => {
  const { executeApi, loading } = useApiCall();

  // 전체 게시판 조회
  const fetchBoards = useCallback(
    async (params?: AdminPageParams) => {
      const result = await executeApi(() => adminApi.getBoards(params), {
        successMessage: null,
        errorMessage: '게시판 목록 조회에 실패했습니다.',
      });

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  // 상담 게시판 조회
  const fetchConsultationBoards = useCallback(
    async (params?: AdminPageParams) => {
      const result = await executeApi(
        () => adminApi.getConsultationBoards(params),
        {
          successMessage: null,
          errorMessage: '상담 게시판 조회에 실패했습니다.',
        },
      );

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  // 환불 게시판 조회
  const fetchRefundBoards = useCallback(
    async (params?: AdminPageParams) => {
      const result = await executeApi(() => adminApi.getRefundBoards(params), {
        successMessage: null,
        errorMessage: '환불 게시판 조회에 실패했습니다.',
      });

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  // 게시판 상세 조회
  const fetchBoardDetail = useCallback(
    async (boardId: number) => {
      const result = await executeApi(() => adminApi.getBoardDetail(boardId), {
        successMessage: null,
        errorMessage: '게시글 상세 조회에 실패했습니다.',
      });

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  // 답변 등록
  const createAnswer = useCallback(
    async (boardId: number, data: AdminAnswerRequest) => {
      const result = await executeApi(
        () => adminApi.createAnswer(boardId, data),
        {
          successMessage: '답변이 등록되었습니다.',
          errorMessage: '답변 등록에 실패했습니다.',
        },
      );

      return result;
    },
    [executeApi],
  );

  // 답변 수정
  const updateAnswer = useCallback(
    async (boardId: number, data: AdminAnswerRequest) => {
      const result = await executeApi(
        () => adminApi.updateAnswer(boardId, data),
        {
          successMessage: '답변이 수정되었습니다.',
          errorMessage: '답변 수정에 실패했습니다.',
        },
      );

      return result;
    },
    [executeApi],
  );

  // 대시보드용 게시판 통계
  const getRefundBoardCount = useCallback(async () => {
    const result = await executeApi(() => adminApi.getRefundBoardCount(), {
      successMessage: null,
      errorMessage: '환불 게시판 수 조회에 실패했습니다.',
    });

    return result.success ? result.data : null;
  }, [executeApi]);

  const getCounselBoardCount = useCallback(async () => {
    const result = await executeApi(() => adminApi.getCounselBoardCount(), {
      successMessage: null,
      errorMessage: '상담 게시판 수 조회에 실패했습니다.',
    });

    return result.success ? result.data : null;
  }, [executeApi]);

  return {
    loading,
    fetchBoards,
    fetchConsultationBoards,
    fetchRefundBoards,
    fetchBoardDetail,
    createAnswer,
    updateAnswer,
    getRefundBoardCount,
    getCounselBoardCount,
  };
};
