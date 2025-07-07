import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEvent } from '@/hooks';
import { ROUTES } from '@/constants';
import { formatDate } from '@/utils';
import { LoadingSpinner } from '@/components/common';
import type { EventDetailResponse } from '@/types/event';

const EventDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { fetchEventDetail } = useEvent();
  const [event, setEvent] = useState<EventDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEventData = async () => {
      if (!id) return;

      try {
        const eventData = await fetchEventDetail(Number(id));
        if (eventData) {
          setEvent(eventData);
        }
      } catch (error) {
        console.error('이벤트 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [id, fetchEventDetail]);

  const handleEdit = () => {
    if (id) {
      navigate(ROUTES.ADMIN.EVENT_EDIT.replace(':id', id));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto mt-8 px-4">
        <div className="flex justify-center items-center min-h-96">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto mt-8 px-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            이벤트를 찾을 수 없습니다.
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-8 mb-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(ROUTES.ADMIN.EVENTS)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          목록으로
        </button>
        <button
          onClick={handleEdit}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          수정
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{event.title}</h1>

        <hr className="my-6 border-gray-200" />

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <span className="text-sm text-gray-500">
            생성일: {formatDate(event.createdAt)}
          </span>
          {event.updatedAt && (
            <span className="text-sm text-gray-500">
              수정일: {formatDate(event.updatedAt)}
            </span>
          )}
        </div>

        <hr className="my-6 border-gray-200" />

        {event.mainImageUrl && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              메인 이미지
            </h3>
            <div className="w-full mb-4">
              <img
                src={event.mainImageUrl}
                alt="이벤트 메인 이미지"
                className="w-full max-h-96 object-contain rounded-lg"
              />
            </div>
          </div>
        )}

        {event.imageUrl && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              상세 이미지
            </h3>
            <div className="w-full mb-4">
              <img
                src={event.imageUrl}
                alt="이벤트 상세 이미지"
                className="w-full max-h-96 object-contain rounded-lg"
              />
            </div>
          </div>
        )}

        {(event.mainImageUrl || event.imageUrl) && (
          <hr className="my-6 border-gray-200" />
        )}

        <div className="mt-6 mb-6">
          <div className="whitespace-pre-wrap text-gray-900">
            {event.content || '이벤트 내용이 없습니다.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
