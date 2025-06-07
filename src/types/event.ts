/**
 * 이벤트 작성 요청
 */
export interface EventCreateRequest {
  title: string;
  mainImageUrl: string;
  imageUrl?: string;
  content?: string;
}

/**
 * 이벤트 수정 요청
 */
export interface EventUpdateRequest {
  title: string;
  mainImageUrl: string;
  imageUrl?: string;
  content?: string;
}

/**
 * 이벤트 목록 아이템
 */
export interface EventListItem {
  eventId: number;
  title: string;
  mainImageUrl: string;
  createdAt: string;
}

/**
 * 이벤트 목록 응답
 */
export interface EventListResponse {
  eventList: EventListItem[];
}

/**
 * 이벤트 상세 응답
 */
export interface EventDetailResponse {
  eventId: number;
  title: string;
  mainImageUrl: string;
  imageUrl?: string;
  content?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * 이벤트 검색 필터
 */
export interface EventSearchFilter {
  keyword?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

/**
 * 이벤트 통계
 */
export interface EventStats {
  totalEvents: number;
  activeEvents: number;
  expiredEvents: number;
  viewCount: number;
}
