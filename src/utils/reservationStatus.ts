import {
  RESERVATION_STATUS,
  RESERVATION_STATUS_COLORS,
} from '@/constants/status';
import { calculateDDay } from './date';

/**
 * 예약 상태별 CSS 클래스 반환 함수
 */
export const getReservationStatusClasses = (
  status: string,
  reservationDate?: string,
): string => {
  const today = new Date().toISOString().split('T')[0];

  // D-Day인 경우 빨간색 우선 적용
  if (status === RESERVATION_STATUS.PAID && reservationDate === today) {
    return 'text-white border-transparent';
  }

  // 기본 상태별 색상 적용
  return 'text-white border-transparent';
};

/**
 * 예약 상태별 배경색 반환 함수
 */
export const getReservationStatusColor = (
  status: string,
  reservationDate?: string,
): string => {
  const today = new Date().toISOString().split('T')[0];

  // D-Day인 경우 빨간색 우선 적용
  if (status === RESERVATION_STATUS.PAID && reservationDate === today) {
    return '#F44336'; // 빨간색 (긴급)
  }

  // 기본 상태별 색상 반환
  return (
    RESERVATION_STATUS_COLORS[
      status as keyof typeof RESERVATION_STATUS_COLORS
    ] || '#757575'
  );
};

/**
 * 예약 상태별 표시 텍스트 반환 함수 (일반용)
 */
export const getReservationStatusText = (
  status: string,
  reservationDate?: string,
): string => {
  const today = new Date().toISOString().split('T')[0];
  switch (status) {
    case RESERVATION_STATUS.COMPLETED:
      return '완료';
    case RESERVATION_STATUS.WORKING:
      return '진행중';
    case RESERVATION_STATUS.PAID:
      if (reservationDate === today) {
        return 'D-Day';
      }
      return '결제완료';
    case RESERVATION_STATUS.MATCHED:
      return '매니저 매칭 성공';
    case RESERVATION_STATUS.PENDING:
      return '매니저 매칭 대기중';
    case RESERVATION_STATUS.CANCELED:
      return '취소됨';
    case RESERVATION_STATUS.APPROVED:
      return '승인됨';
    case RESERVATION_STATUS.REJECTED:
      return '거절됨';
    case RESERVATION_STATUS.FAILURE:
      return '예약실패';
    default:
      return status;
  }
};

/**
 * 예약 상태별 표시 텍스트 반환 함수 (매니저용 - D-Day 계산 포함)
 */
export const getManagerReservationStatusText = (
  status: string,
  reservationDate?: string,
): string => {
  switch (status) {
    case RESERVATION_STATUS.COMPLETED:
      return '완료';
    case RESERVATION_STATUS.WORKING:
      return '작업중';
    case RESERVATION_STATUS.PAID:
      if (reservationDate) {
        return calculateDDay(reservationDate);
      }
      return '예약완료';
    case RESERVATION_STATUS.MATCHED:
      return '결제대기중';
    case RESERVATION_STATUS.PENDING:
      return '예약 요청 승낙 대기중';
    case RESERVATION_STATUS.CANCELED:
      return '취소됨';
    case RESERVATION_STATUS.APPROVED:
      return '승인됨';
    case RESERVATION_STATUS.REJECTED:
      return '거절됨';
    case RESERVATION_STATUS.FAILURE:
      return '예약실패';
    default:
      return status;
  }
};
