import { apiClient, type ApiResponse, handleApiError } from '../index';

// 이벤트 관련 타입 정의
export interface EventRequestDto {
  title: string;
  mainImageUrl: string;
  imageUrl?: string;
  content?: string;
}

export interface EventResponseDto {
  eventId: number;
  title: string;
  mainImageUrl?: string;
  imageUrl?: string;
  content?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EventListItem {
  eventId: number;
  title: string;
  mainImageUrl: string;
  createdAt: string;
}

export interface EventListResponseDto {
  eventList: EventListItem[];
}

// 이벤트 API 함수들
export const eventApi = {
  // 이벤트 전체 조회
  getAllEvents: async (): Promise<EventListResponseDto> => {
    try {
      const response =
        await apiClient.get<ApiResponse<EventListResponseDto>>('/api/events');
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 이벤트 상세 조회
  getEventById: async (eventId: number): Promise<EventResponseDto> => {
    try {
      const response = await apiClient.get<ApiResponse<EventResponseDto>>(
        `/api/event/${eventId}`,
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 이벤트 생성 (관리자용)
  createEvent: async (data: EventRequestDto): Promise<void> => {
    try {
      await apiClient.post<ApiResponse<void>>('/api/admin/event', data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 이벤트 수정 (관리자용)
  updateEvent: async (
    eventId: number,
    data: EventRequestDto,
  ): Promise<void> => {
    try {
      await apiClient.patch<ApiResponse<void>>(`/api/admin/event/${eventId}`, data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 이벤트 삭제 (관리자용)
  deleteEvent: async (eventId: number): Promise<void> => {
    try {
      await apiClient.delete<ApiResponse<void>>(`/api/admin/event/${eventId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
