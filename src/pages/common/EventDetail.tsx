import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Share2 } from 'lucide-react';
import { useEvent, useToast } from '@/hooks';
import { ROUTES } from '@/constants';
import { formatDate } from '@/utils';
import { ERROR_MESSAGES, INFO_MESSAGES } from '@/constants/message';
import type { EventDetailResponse } from '@/types/event';
import { Header } from '@/components';
import ShareModal from '@/components/common/ShareModal/ShareModal';

const EventDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { fetchEventDetail, loading } = useEvent();
  const { showToast } = useToast();

  const [event, setEvent] = useState<EventDetailResponse | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // 이벤트 상세 정보 조회
  useEffect(() => {
    const loadEventDetail = async () => {
      if (!id) {
        navigate(ROUTES.HOME);
        return;
      }

      try {
        const eventData = await fetchEventDetail(parseInt(id));
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

  // 공유하기
  const handleShare = () => {
    setShareModalOpen(true);
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          variant="sub"
          title="이벤트 상세"
          backRoute={ROUTES.EVENTS}
          showMenu={true}
        />

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
        <Header
          variant="sub"
          title="이벤트 상세"
          backRoute={ROUTES.EVENTS}
          showMenu={true}
        />

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
      <Header
        variant="sub"
        title="이벤트 상세"
        backRoute={ROUTES.EVENTS}
        showMenu={true}
      />

      <main className="pt-20 pb-24 px-4">
        <div className="max-w-md mx-auto">
          {/* 메인 이미지와 기본 정보 */}
          <div className="bg-white rounded-2xl overflow-hidden mb-6">
            {/* 메인 이미지 */}
            <div className="relative">
              {event.mainImageUrl ? (
                <div className="w-full h-48 relative">
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
                  <div className="hidden w-full h-full bg-orange-100 absolute inset-0 items-center justify-center">
                    <div className="text-center text-orange-600">
                      <Calendar className="w-12 h-12 mx-auto mb-2" />
                      <span className="text-sm font-medium">
                        이미지를 불러올 수 없습니다
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-48 bg-orange-100 flex items-center justify-center">
                  <div className="text-center text-orange-600">
                    <Calendar className="w-12 h-12 mx-auto mb-2" />
                    <span className="text-sm font-medium">이벤트 이미지</span>
                  </div>
                </div>
              )}
            </div>

            {/* 제목과 메타 정보 */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900 flex-1 mr-4 leading-tight">
                  {event.title}
                </h1>
                <button
                  onClick={handleShare}
                  className="p-2 bg-orange-50 text-orange-500 rounded-full hover:bg-orange-100 transition-colors flex-shrink-0"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* 이벤트 메타 정보 */}
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2 text-orange-400" />
                <span>{formatDate(event.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* 콘텐츠 */}
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              이벤트 상세
            </h2>

            {/* 추가 이미지가 있는 경우 표시 */}
            {event.imageUrl && (
              <div className="mb-6">
                <img
                  src={event.imageUrl}
                  alt={`${event.title} 상세 이미지`}
                  className="w-full rounded-xl object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {event.content ||
                `🎉 ${event.title}에 참여하세요!

이벤트에 대한 자세한 내용은 고객센터로 문의해주세요.

📞 문의사항이 있으시면 고객센터로 연락주세요.`}
            </div>

            {/* 이벤트 목록으로 이동 */}
            <div className="text-center pt-8 mt-8 border-t border-gray-100">
              <button
                onClick={() => navigate(ROUTES.EVENTS)}
                className="text-orange-500 hover:text-orange-600 transition-colors font-medium"
              >
                이벤트 목록 보기
              </button>
            </div>
          </div>
        </div>
      </main>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={event?.title || '이벤트'}
        url={window.location.href}
        text={`${event?.title} - MaidLab 이벤트`}
      />
    </div>
  );
};

export default EventDetail;
