import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Share2 } from 'lucide-react';
import { useEvent, useToast } from '@/hooks';
import { ROUTES } from '@/constants';
import { formatDate, formatDateTime, copyToClipboard } from '@/utils';
import {
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  INFO_MESSAGES,
} from '@/constants/message';
import type { EventDetailResponse } from '@/types/event';

const EventDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { fetchEventDetail, loading } = useEvent();
  const { showToast } = useToast();

  const [event, setEvent] = useState<EventDetailResponse | null>(null);

  // 이벤트 상세 정보 조회
  useEffect(() => {
    const loadEventDetail = async () => {
      if (!id) {
        navigate(ROUTES.HOME);
        return;
      }

      try {
        const eventData = await fetchEventDetail(parseInt(id));
        console.log('id:', id, 'eventData:', eventData);
        if (eventData) {
          setEvent(eventData);
        } else {
          showToast(ERROR_MESSAGES.NO_DATA, 'error');
          navigate(ROUTES.HOME);
        }
      } catch (error) {
        console.error('이벤트 상세 조회 실패:', error);
        showToast(ERROR_MESSAGES.LOAD_FAILED, 'error');
        navigate(ROUTES.HOME);
      }
    };

    loadEventDetail();
  }, [id, fetchEventDetail, navigate, showToast]);

  // 뒤로가기
  const handleBack = () => {
    navigate(ROUTES.EVENTS);
  };

  // 공유하기
  const handleShare = async () => {
    const shareData = {
      title: event?.title || '이벤트',
      text: `${event?.title} - MaidLab 이벤트`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await copyToClipboard(window.location.href);
        showToast(SUCCESS_MESSAGES.COPY, 'success');
      }
    } catch (error) {
      console.error('공유 실패:', error);
      showToast('공유에 실패했습니다.', 'error');
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
          <div className="flex items-center h-16 px-4">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold ml-4">이벤트 상세</h1>
          </div>
        </header>

        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] pt-16">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">{INFO_MESSAGES.LOADING}</p>
          </div>
        </div>
      </div>
    );
  }

  // 이벤트 정보가 없는 경우
  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
          <div className="flex items-center h-16 px-4">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold ml-4">이벤트 상세</h1>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] pt-16 px-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              이벤트를 찾을 수 없습니다
            </h2>
            <p className="text-gray-600 mb-6">
              요청하신 이벤트가 존재하지 않거나 삭제되었습니다.
            </p>
            <button
              onClick={() => navigate(ROUTES.HOME)}
              className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>

          <h1 className="text-lg font-semibold absolute left-1/2 transform -translate-x-1/2">
            이벤트 상세
          </h1>

          {/* 공유 버튼 */}
          <button
            onClick={handleShare}
            className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="pt-16 pb-24">
        <div className="max-w-md mx-auto">
          {/* 메인 이미지와 기본 정보 */}
          <div className="bg-white rounded-2xl overflow-hidden mb-4 shadow-sm">
            {/* 메인 이미지 */}
            <div className="relative">
              {event.mainImageUrl ? (
                <div className="w-full h-64 relative">
                  <img
                    src={event.mainImageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget
                        .nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.classList.remove('hidden');
                        fallback.classList.add('flex');
                      }
                    }}
                  />

                  {/* 이미지 로드 실패 시 폴백 */}
                  <div className="hidden w-full h-full bg-gradient-to-r from-orange-400 to-orange-500 absolute inset-0 items-center justify-center">
                    <div className="text-center text-white">
                      <Calendar className="w-16 h-16 mx-auto mb-4 opacity-80" />
                      <h2 className="text-xl font-bold">{event.title}</h2>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-80" />
                    <h2 className="text-xl font-bold">{event.title}</h2>
                  </div>
                </div>
              )}
            </div>

            {/* 제목과 메타 정보 */}
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {event.title}
              </h1>

              {/* 이벤트 메타 정보 */}
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-3 text-orange-500" />
                  <span className="text-sm">
                    {formatDate(event.createdAt)} 등록
                  </span>
                </div>

                {event.updatedAt && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-3 text-orange-500" />
                    <span className="text-sm">
                      {formatDateTime(event.updatedAt)} 수정
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 콘텐츠 */}
          <div className="px-4">
            {/* 이벤트 상세 내용 */}
            <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                이벤트 상세
              </h2>

              {/* 추가 이미지가 있는 경우 표시 */}
              {event.imageUrl && (
                <div className="mb-6">
                  <img
                    src={event.imageUrl}
                    alt={`${event.title} 상세 이미지`}
                    className="w-full rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                  {event.content ||
                    `🎉 ${event.title}에 참여하세요!

이벤트에 대한 자세한 내용은 고객센터로 문의해주세요.

📞 문의사항이 있으시면 고객센터로 연락주세요.`}
                </div>
              </div>
            </div>

            {/* 이벤트 목록으로 이동 */}
            <div className="text-center pt-4">
              <button
                onClick={() => navigate(ROUTES.EVENTS)}
                className="text-orange-500 hover:text-orange-600 transition-colors text-sm font-medium"
              >
                이벤트 목록
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventDetail;
