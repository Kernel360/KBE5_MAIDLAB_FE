import { useState, useEffect, useCallback } from 'react';
import { useEvent } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { formatDate } from '@/utils';
import { LoadingSpinner } from '@/components/common';

const EventList = () => {
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const { events, loading, fetchEvents, deleteEvent } = useEvent();
  const navigate = useNavigate();

  useEffect(() => {
    if (!events) return;
    setFilteredEvents(events);
  }, [events]);

  const handleDelete = useCallback(async (eventId: number) => {
    if (window.confirm('이벤트를 삭제하시겠습니까?')) {
      const result = await deleteEvent(eventId);
      if (result.success) {
        await fetchEvents();
      }
    }
  }, [deleteEvent, fetchEvents]);

  const handleEdit = useCallback((eventId: number) => {
    navigate(`${ROUTES.ADMIN.EVENT_EDIT.replace(':id', String(eventId))}`);
  }, [navigate]);

  const handleCreate = useCallback(() => {
    navigate(ROUTES.ADMIN.EVENT_CREATE);
  }, [navigate]);

  const handleView = useCallback((eventId: number) => {
    navigate(`${ROUTES.ADMIN.EVENT_DETAIL.replace(':id', String(eventId))}`);
  }, [navigate]);

  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">이벤트 관리</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          이벤트 생성
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">생성일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수정일</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <tr key={event.eventId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(event.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.updatedAt ? formatDate(event.updatedAt) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleView(event.eventId)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="상세보기"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEdit(event.eventId)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="수정"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(event.eventId)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="삭제"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  이벤트가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventList; 