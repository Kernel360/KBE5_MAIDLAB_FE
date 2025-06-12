import { useState, useCallback } from 'react';
import { adminApi } from '@/apis/admin';
import type { PageParams } from '@/apis/admin';
import type { AnswerRequestDto } from '@/apis/board';
import { useToast } from './useToast';

export const useAdmin = () => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // 매니저 관리
  const managerManagement = {
    // 매니저 목록 조회
    fetchManagers: useCallback(
      async (params?: PageParams) => {
        try {
          setLoading(true);
          const data = await adminApi.getManagers(params);
          return data;
        } catch (error: any) {
          showToast(
            error.message || '매니저 목록 조회에 실패했습니다.',
            'error',
          );
          return null;
        } finally {
          setLoading(false);
        }
      },
      [showToast],
    ),

    // 매니저 상세 조회
    fetchManager: useCallback(
      async (managerId: number) => {
        try {
          setLoading(true);
          const data = await adminApi.getManager(managerId);
          return data;
        } catch (error: any) {
          showToast(
            error.message || '매니저 정보 조회에 실패했습니다.',
            'error',
          );
          return null;
        } finally {
          setLoading(false);
        }
      },
      [showToast],
    ),

    // 매니저 승인
    approveManager: useCallback(
      async (managerId: number) => {
        try {
          const result = await adminApi.approveManager(managerId);
          showToast('매니저가 승인되었습니다.', 'success');
          return { success: true, data: result };
        } catch (error: any) {
          showToast(error.message || '매니저 승인에 실패했습니다.', 'error');
          return { success: false, error: error.message };
        }
      },
      [showToast],
    ),

    // 매니저 거절
    rejectManager: useCallback(
      async (managerId: number) => {
        try {
          const result = await adminApi.rejectManager(managerId);
          showToast('매니저가 거절되었습니다.', 'success');
          return { success: true, data: result };
        } catch (error: any) {
          showToast(error.message || '매니저 거절에 실패했습니다.', 'error');
          return { success: false, error: error.message };
        }
      },
      [showToast],
    ),
  };

  // 소비자 관리
  const consumerManagement = {
    // 소비자 목록 조회
    fetchConsumers: useCallback(
      async (params?: PageParams) => {
        try {
          setLoading(true);
          const data = await adminApi.getConsumers(params);
          return data;
        } catch (error: any) {
          showToast(
            error.message || '소비자 목록 조회에 실패했습니다.',
            'error',
          );
          return null;
        } finally {
          setLoading(false);
        }
      },
      [showToast],
    ),

    // 소비자 상세 조회
    fetchConsumer: useCallback(
      async (consumerId: number) => {
        try {
          const data = await adminApi.getConsumer(consumerId);
          return data;
        } catch (error: any) {
          showToast(
            error.message || '소비자 정보 조회에 실패했습니다.',
            'error',
          );
          return null;
        }
      },
      [showToast],
    ),
  };

  // 예약 관리
  const reservationManagement = {
    // 전체 예약 조회
    fetchReservations: useCallback(
      async (params?: PageParams) => {
        try {
          setLoading(true);
          const data = await adminApi.getReservations(params);
          return data;
        } catch (error: any) {
          showToast(error.message || '예약 목록 조회에 실패했습니다.', 'error');
          return [];
        } finally {
          setLoading(false);
        }
      },
      [showToast],
    ),

    // 예약 상세 조회
    fetchReservation: useCallback(
      async (reservationId: number) => {
        try {
          const data = await adminApi.getReservation(reservationId);
          return data;
        } catch (error: any) {
          showToast(error.message || '예약 상세 조회에 실패했습니다.', 'error');
          return null;
        }
      },
      [showToast],
    ),

    // 일별 예약 조회
    fetchDailyReservations: useCallback(
      async (date: string, params?: PageParams) => {
        try {
          const data = await adminApi.getDailyReservations(date, params);
          return data;
        } catch (error: any) {
          showToast(error.message || '일별 예약 조회에 실패했습니다.', 'error');
          return [];
        }
      },
      [showToast],
    ),

    // 주간 정산 조회
    fetchWeeklySettlements: useCallback(
      async (startDate: string, params?: PageParams) => {
        try {
          const data = await adminApi.getWeeklySettlements(startDate, params);
          return data;
        } catch (error: any) {
          showToast(error.message || '정산 정보 조회에 실패했습니다.', 'error');
          return null;
        }
      },
      [showToast],
    ),

    // 정산 상세 조회
    fetchSettlementDetail: useCallback(
      async (settlementId: number) => {
        try {
          setLoading(true);
          const response = await adminApi.getSettlementDetail(settlementId);
          return response.data;
        } catch (error: any) {
          showToast(error.message || '정산 상세 정보 조회에 실패했습니다.', 'error');
          return null;
        } finally {
          setLoading(false);
        }
      },
      [showToast],
    ),
  };

  // 매칭 관리
  const matchingManagement = {
    // 전체 매칭 조회
    fetchAllMatching: useCallback(
      async (params?: PageParams) => {
        try {
          const data = await adminApi.getAllMatching(params);
          return data;
        } catch (error: any) {
          showToast(error.message || '매칭 목록 조회에 실패했습니다.', 'error');
          return [];
        }
      },
      [showToast],
    ),

    // 상태별 매칭 조회
    fetchMatchingByStatus: useCallback(
      async (status: string, params?: PageParams) => {
        try {
          const data = await adminApi.getMatchingByStatus(status, params);
          return data;
        } catch (error: any) {
          showToast(error.message || '매칭 조회에 실패했습니다.', 'error');
          return [];
        }
      },
      [showToast],
    ),

    // 매니저 변경
    changeManager: useCallback(
      async (reservationId: number, managerId: number) => {
        try {
          const result = await adminApi.changeManager(reservationId, managerId);
          showToast('매니저가 변경되었습니다.', 'success');
          return { success: true, data: result };
        } catch (error: any) {
          showToast(error.message || '매니저 변경에 실패했습니다.', 'error');
          return { success: false, error: error.message };
        }
      },
      [showToast],
    ),
  };

  // 게시판 관리
  const boardManagement = {
    // 전체 게시판 조회
    fetchBoards: useCallback(
      async (params?: PageParams) => {
        try {
          const data = await adminApi.getBoards(params);
          return data;
        } catch (error: any) {
          showToast(error.message || '게시판 조회에 실패했습니다.', 'error');
          return [];
        }
      },
      [showToast],
    ),

    // 상담 게시판 조회
    fetchConsultationBoards: useCallback(
      async (params?: PageParams) => {
        try {
          const data = await adminApi.getConsultationBoards(params);
          return data;
        } catch (error: any) {
          showToast(
            error.message || '상담 게시판 조회에 실패했습니다.',
            'error',
          );
          return [];
        }
      },
      [showToast],
    ),

    // 환불 게시판 조회
    fetchRefundBoards: useCallback(
      async (params?: PageParams) => {
        try {
          const data = await adminApi.getRefundBoards(params);
          return data;
        } catch (error: any) {
          showToast(
            error.message || '환불 게시판 조회에 실패했습니다.',
            'error',
          );
          return [];
        }
      },
      [showToast],
    ),

    // 게시판 상세 조회
    fetchBoardDetail: useCallback(
      async (boardId: number) => {
        try {
          const data = await adminApi.getBoardDetail(boardId);
          return data;
        } catch (error: any) {
          showToast(
            error.message || '게시글 상세 조회에 실패했습니다.',
            'error',
          );
          return null;
        }
      },
      [showToast],
    ),

    // 답변 등록
    createAnswer: useCallback(
      async (boardId: number, data: AnswerRequestDto) => {
        try {
          const result = await adminApi.createAnswer(boardId, data);
          showToast('답변이 등록되었습니다.', 'success');
          return { success: true, data: result };
        } catch (error: any) {
          const errorMessage = error.message || '답변 등록에 실패했습니다.';
          showToast(errorMessage, 'error');
          return { success: false, error: errorMessage };
        }
      },
      [showToast],
    ),

    // 답변 수정
    updateAnswer: useCallback(
      async (answerId: number, data: AnswerRequestDto) => {
        try {
          const result = await adminApi.updateAnswer(answerId, data);
          showToast('답변이 수정되었습니다.', 'success');
          return { success: true, data: result };
        } catch (error: any) {
          showToast(error.message || '답변 수정에 실패했습니다.', 'error');
          return { success: false, error: error.message };
        }
      },
      [showToast],
    ),
  };

  return {
    loading,
    managerManagement,
    consumerManagement,
    reservationManagement,
    matchingManagement,
    boardManagement,
  };
};
