import { useState, useEffect, useCallback } from 'react';
import { eventApi } from '@/apis/event';
import { useToast } from './useToast';
import type { EventRequestDto, EventListItem } from '@/apis/event';

export const useEvent = () => {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // 이벤트 목록 조회
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await eventApi.getAllEvents();
      setEvents(data.eventList || []);
    } catch (error: any) {
      showToast(
        error.message || '이벤트 목록을 불러오는데 실패했습니다.',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // 이벤트 상세 조회
  const fetchEventDetail = useCallback(
    async (eventId: number) => {
      try {
        setLoading(true);
        const data = await eventApi.getEventById(eventId);
        return data;
      } catch (error: any) {
        showToast(
          error.message || '이벤트를 불러오는데 실패했습니다.',
          'error',
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  // 이벤트 생성 (관리자용)
  const createEvent = useCallback(
    async (data: EventRequestDto) => {
      try {
        setLoading(true);
        await eventApi.createEvent(data);

        await fetchEvents(); // 목록 새로고침
        showToast('이벤트가 생성되었습니다.', 'success');

        return { success: true };
      } catch (error: any) {
        showToast(error.message || '이벤트 생성에 실패했습니다.', 'error');
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchEvents, showToast],
  );

  // 이벤트 수정 (관리자용)
  const updateEvent = useCallback(
    async (eventId: number, data: EventRequestDto) => {
      try {
        setLoading(true);
        await eventApi.updateEvent(eventId, data);

        await fetchEvents(); // 목록 새로고침
        showToast('이벤트가 수정되었습니다.', 'success');

        return { success: true };
      } catch (error: any) {
        showToast(error.message || '이벤트 수정에 실패했습니다.', 'error');
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchEvents, showToast],
  );

  // 이벤트 삭제 (관리자용)
  const deleteEvent = useCallback(
    async (eventId: number) => {
      try {
        await eventApi.deleteEvent(eventId);

        // 로컬 상태에서 제거
        setEvents((prev) => prev.filter((event) => event.eventId !== eventId));
        showToast('이벤트가 삭제되었습니다.', 'success');

        return { success: true };
      } catch (error: any) {
        showToast(error.message || '이벤트 삭제에 실패했습니다.', 'error');
        return { success: false, error: error.message };
      }
    },
    [showToast],
  );

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    fetchEvents,
    fetchEventDetail,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};
