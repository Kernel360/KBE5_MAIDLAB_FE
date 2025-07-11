import { useState, useEffect, useCallback } from 'react';
import { eventApi } from '@/apis/event';
import { useApiCall } from '../useApiCall';
import type {
  EventCreateRequest,
  EventUpdateRequest,
  EventListItem,
} from '@/types/domain/event';

export const useEvent = () => {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [hasNetworkError, setHasNetworkError] = useState(false);
  const { executeApi, loading } = useApiCall();

  // 이벤트 목록 조회
  const fetchEvents = useCallback(async () => {
    if (hasNetworkError) return;

    const result = await executeApi(() => eventApi.getAllEvents(), {
      successMessage: null,
      errorMessage: '이벤트 목록을 불러오는데 실패했습니다.',
    });

    if (result.success) {
      setEvents(result.data?.eventList || []);
      setHasNetworkError(false);
    } else {
      setHasNetworkError(true);
    }

    return result;
  }, [executeApi, hasNetworkError]);

  // 이벤트 상세 조회
  const fetchEventDetail = useCallback(
    async (eventId: number) => {
      const result = await executeApi(() => eventApi.getEventById(eventId), {
        successMessage: null,
        errorMessage: '이벤트를 불러오는데 실패했습니다.',
      });

      return result.success ? result.data : null;
    },
    [executeApi],
  );

  // 활성화된 이벤트 (EventListItem에는 isActive가 없으므로 모든 이벤트 반환)
  const getActiveEvents = useCallback(() => {
    // EventListItem에는 isActive나 날짜 필드가 없으므로
    // 모든 이벤트를 활성 이벤트로 간주하거나
    // 최신 순으로 정렬해서 반환
    return events
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5); // 최신 5개만
  }, [events]);

  // 이벤트 생성 (관리자용)
  const createEvent = useCallback(
    async (data: EventCreateRequest) => {
      const result = await executeApi(() => eventApi.createEvent(data), {
        successMessage: '이벤트가 생성되었습니다.',
        errorMessage: '이벤트 생성에 실패했습니다.',
      });

      if (result.success) {
        await fetchEvents(); // 목록 새로고침
      }

      return result;
    },
    [executeApi, fetchEvents],
  );

  // 이벤트 수정 (관리자용)
  const updateEvent = useCallback(
    async (eventId: number, data: EventUpdateRequest) => {
      const result = await executeApi(
        () => eventApi.updateEvent(eventId, data),
        {
          successMessage: '이벤트가 수정되었습니다.',
          errorMessage: '이벤트 수정에 실패했습니다.',
        },
      );

      if (result.success) {
        await fetchEvents(); // 목록 새로고침
      }

      return result;
    },
    [executeApi, fetchEvents],
  );

  // 이벤트 삭제 (관리자용)
  const deleteEvent = useCallback(
    async (eventId: number) => {
      const result = await executeApi(() => eventApi.deleteEvent(eventId), {
        successMessage: '이벤트가 삭제되었습니다.',
        errorMessage: '이벤트 삭제에 실패했습니다.',
      });

      if (result.success) {
        // 로컬 상태에서 제거
        setEvents((prev) => prev.filter((event) => event.eventId !== eventId));
      }

      return result;
    },
    [executeApi],
  );

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    activeEvents: getActiveEvents(), // 최신 이벤트들
    loading,
    fetchEvents,
    fetchEventDetail,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};
