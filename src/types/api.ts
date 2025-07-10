/**
 * API 응답 기본 구조
 */
export interface ApiResponse<T = any> {
  data: T;
  message: string;
  code: string;
}

/**
 * 페이지네이션 파라미터
 */
export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * 페이지네이션 응답
 */
export interface PaginationResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  sort?: SortInfo;
  pageable?: PageableInfo;
}

/**
 * 정렬 정보
 */
export interface SortInfo {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

/**
 * 페이지 정보
 */
export interface PageableInfo {
  offset: number;
  sort: SortInfo;
  paged: boolean;
  pageNumber: number;
  pageSize: number;
  unpaged: boolean;
}

/**
 * 에러 응답
 */
export interface ApiError {
  code: string;
  message: string;
  status?: number;
  timestamp?: string;
  path?: string;
}

/**
 * 파일 업로드 응답
 */
export interface FileUploadResponse {
  fileName: string;
  originalFileName: string;
  fileSize: number;
  fileUrl: string;
  contentType: string;
  uploadedAt: string;
}

/**
 * 검색 필터 기본 인터페이스
 */
export interface SearchFilter {
  keyword?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  category?: string;
}

/**
 * 정렬 옵션
 */
export interface SortOption {
  field: string;
  direction: 'ASC' | 'DESC';
}

/**
 * API 요청 설정
 */
export interface RequestConfig {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

/**
 * S3 Presigned URL 응답 타입
 */
export interface PresignedUrlResponse {
  key: string;
  url: string;
}
