import type { ReservationPagingParams } from '../domain/reservation';

/**
 * 매니저 예약 목록 UI에서 사용하는 필터 상태 타입
 * @description 'TODAY'는 API status가 아닌, 클라이언트에서 날짜 기준으로 필터링하기 위한 값입니다.
 */
export type ManagerStatusFilter = 'TODAY' | 'PAID' | 'WORKING' | 'COMPLETED';

/**
 * useManagerReservationPagination 훅의 옵션 타입
 */
export interface UseManagerReservationPaginationOptions {
  initialStatus?: ManagerStatusFilter;
  initialPage?: number;
  pageSize?: number;
  initialSortBy?: ReservationPagingParams['sortBy'];
  initialSortOrder?: 'ASC' | 'DESC';
}
