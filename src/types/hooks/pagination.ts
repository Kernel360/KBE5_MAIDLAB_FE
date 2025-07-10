// 페이지네이션 관련 타입 정의

/**
 * usePagination 훅의 프로퍼티 타입
 */
export interface UsePaginationProps {
  totalItems: number;
  itemsPerPage?: number;
  initialPage?: number;
}

/**
 * 페이지네이션 상태 타입
 */
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * 페이지네이션 액션 타입
 */
export interface PaginationActions {
  goToPage: (page: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  goToFirst: () => void;
  goToLast: () => void;
}

/**
 * usePagination 훅의 반환 타입
 */
export interface UsePaginationReturn
  extends PaginationState,
    PaginationActions {}

/**
 * 페이지네이션 정보 타입 (API 응답 등에서 사용)
 */
export interface PaginationInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
