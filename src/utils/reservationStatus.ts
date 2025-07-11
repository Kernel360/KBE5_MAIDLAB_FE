import { RESERVATION_STATUS } from '@/constants/status';

/**
 * 예약 상태별 CSS 클래스 반환 함수
 */
export const getReservationStatusClasses = (
  status: string,
  reservationDate?: string,
): string => {
  const today = new Date().toISOString().split('T')[0];

  switch (status) {
    case RESERVATION_STATUS.COMPLETED:
      return 'bg-green-100 text-green-800 border-green-200';
    case RESERVATION_STATUS.WORKING:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case RESERVATION_STATUS.MATCHED:
      if (reservationDate === today) {
        return 'bg-red-100 text-red-800 border-red-200'; // D-Day
      }
      return 'bg-amber-100 text-amber-800 border-amber-200'; // Scheduled
    case RESERVATION_STATUS.PENDING:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case RESERVATION_STATUS.CANCELED:
      return 'bg-gray-100 text-gray-600 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * 예약 상태별 표시 텍스트 반환 함수
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
    case RESERVATION_STATUS.MATCHED:
      if (reservationDate === today) {
        return 'D-Day';
      }
      return '예약됨';
    case RESERVATION_STATUS.PENDING:
      return '대기중';
    case RESERVATION_STATUS.CANCELED:
      return '취소됨';
    default:
      return status;
  }
};
