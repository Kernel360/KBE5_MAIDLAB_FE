import { useMemo } from 'react';
import { useAdminManagers } from './useAdminManagers';
import { useAdminConsumers } from './useAdminConsumers';
import { useAdminReservations } from './useAdminReservations';
import { useAdminBoard } from './useAdminBoard';
import { useAdminMatching } from './useAdminMatching';
import { useAdminDashboard } from './useAdminDashboard';

/**
 * 관리자 페이지에서 사용하는 통합 훅
 * 모든 관리자 기능을 하나의 인터페이스로 제공
 */
export const useAdmin = () => {
  const adminManagers = useAdminManagers();
  const adminConsumers = useAdminConsumers();
  const adminReservations = useAdminReservations();
  const adminBoard = useAdminBoard();
  const adminMatching = useAdminMatching();
  const adminDashboard = useAdminDashboard();

  // 전체 로딩 상태
  const loading = useMemo(() => {
    return adminManagers.loading || adminConsumers.loading || adminReservations.loading;
  }, [adminManagers.loading, adminConsumers.loading, adminReservations.loading]);

  // 대시보드 관련 기능 - 개별 메서드들을 직접 노출
  const dashboard = useMemo(() => ({
    ...adminDashboard,
    // 개별 통계 조회 메서드들 (Dashboard 컴포넌트에서 사용)
    getManagerCount: async () => {
      const result = await adminDashboard.fetchDashboardData();
      return { data: result.managerCount };
    },
    getNewManagerCount: async () => {
      const result = await adminDashboard.fetchDashboardData();
      return { data: result.newManagerCount };
    },
    getConsumerCount: async () => {
      const result = await adminDashboard.fetchDashboardData();
      return { data: result.consumerCount };
    },
    getTodayReservationCount: async () => {
      const result = await adminDashboard.fetchDashboardData();
      return { data: result.todayReservationCount };
    },
    // getEventCount는 이미 useAdminDashboard에서 제공하므로 wrapper로 감싸기
    getEventCount: async () => {
      const result = await adminDashboard.getEventCount();
      return { data: result };
    },
    getRefundBoardCount: async () => {
      const result = await adminDashboard.fetchDashboardData();
      return { data: result.refundBoardCount };
    },
    getCounselBoardCount: async () => {
      const result = await adminDashboard.fetchDashboardData();
      return { data: result.counselBoardCount };
    },
  }), [adminDashboard]);

  // 게시판 관리 기능
  const boardManagement = useMemo(() => ({
    ...adminBoard,
  }), [adminBoard]);

  // 예약 관리 기능
  const reservationManagement = useMemo(() => ({
    ...adminReservations,
  }), [adminReservations]);

  // 매니저 관리 기능
  const managerManagement = useMemo(() => ({
    ...adminManagers,
  }), [adminManagers]);

  // 소비자 관리 기능
  const consumerManagement = useMemo(() => ({
    ...adminConsumers,
  }), [adminConsumers]);

  // 매칭 관리 기능
  const matchingManagement = useMemo(() => ({
    ...adminMatching,
  }), [adminMatching]);

  return {
    loading,
    dashboard,
    boardManagement,
    reservationManagement,
    managerManagement,
    consumerManagement,
    matchingManagement,
  };
};