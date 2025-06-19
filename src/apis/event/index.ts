import { apiCall } from '../index';
import type {
  EventCreateRequest,
  EventUpdateRequest,
  EventListResponse,
  EventDetailResponse,
} from '@/types/event';
import { API_ENDPOINTS } from '@/constants/api';

export const eventApi = {
  /**
   * 이벤트 전체 조회
   */
  getAllEvents: async (): Promise<EventListResponse> => {
    return apiCall<EventListResponse>('get', API_ENDPOINTS.EVENT.LIST);
  },

  /**
   * 이벤트 상세 조회
   */
  getEventById: async (eventId: number): Promise<EventDetailResponse> => {
    return apiCall<EventDetailResponse>(
      'get',
      API_ENDPOINTS.EVENT.DETAIL(eventId),
    );
  },

  /**
   * 이벤트 생성 (관리자용)
   */
  createEvent: async (data: EventCreateRequest): Promise<void> => {
    return apiCall<void>('post', API_ENDPOINTS.EVENT.CREATE, data);
  },

  /**
   * 이벤트 수정 (관리자용)
   */
  updateEvent: async (
    eventId: number,
    data: EventUpdateRequest,
  ): Promise<void> => {
    return apiCall<void>('patch', API_ENDPOINTS.EVENT.UPDATE(eventId), data);
  },

  /**
   * 이벤트 삭제 (관리자용)
   */
  deleteEvent: async (eventId: number): Promise<void> => {
    return apiCall<void>('delete', API_ENDPOINTS.EVENT.DELETE(eventId));
  },
};
