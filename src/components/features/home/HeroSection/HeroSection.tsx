import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import type { EventListItem } from '@/apis/event';

interface HeroSectionProps {
  onEventClick?: (eventId: number) => void;
  events?: EventListItem[];
  loading?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onEventClick,
  events = [],
  loading = false,
}) => {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  // 기본 이벤트 데이터 (이벤트가 없을 때)
  const defaultEvents: Partial<EventListItem>[] = [
    {
      eventId: 1,
      title: '첫 예약 20% 할인',
      mainImageUrl: '',
      createdAt: new Date().toISOString(),
    },
    {
      eventId: 2,
      title: '연말 대청소 이벤트',
      mainImageUrl: '',
      createdAt: new Date().toISOString(),
    },
    {
      eventId: 3,
      title: '친구 추천 이벤트',
      mainImageUrl: '',
      createdAt: new Date().toISOString(),
    },
  ];

  // 실제 이벤트가 있으면 사용하고, 없으면 기본 이벤트 사용
  const displayEvents =
    events.length > 0 ? events : (defaultEvents as EventListItem[]);
  const currentEvent = displayEvents[currentEventIndex];

  // 자동 슬라이드 (5초마다, 이벤트가 2개 이상일 때만)
  useEffect(() => {
    if (displayEvents.length > 1) {
      const interval = setInterval(() => {
        setCurrentEventIndex((prev) => (prev + 1) % displayEvents.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [displayEvents.length]);

  // 인덱스 초기화 (이벤트 배열이 변경될 때)
  useEffect(() => {
    if (currentEventIndex >= displayEvents.length) {
      setCurrentEventIndex(0);
    }
  }, [displayEvents.length, currentEventIndex]);

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentEventIndex((prev) =>
      prev === 0 ? displayEvents.length - 1 : prev - 1,
    );
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentEventIndex((prev) => (prev + 1) % displayEvents.length);
  };

  const handleEventClick = () => {
    if (onEventClick && currentEvent?.eventId) {
      onEventClick(currentEvent.eventId);
    }
  };

  const handleIndicatorClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setCurrentEventIndex(index);
  };

  // 로딩 상태
  if (loading) {
    return (
      <section className="relative mb-8">
        <div className="w-full h-48 bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl animate-pulse">
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">이벤트 로딩 중...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative mb-8">
      {/* 메인 이벤트 배너 */}
      <div className="relative">
        <button
          onClick={handleEventClick}
          className="w-full relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
        >
          {/* 메인 이미지가 있으면 전체 화면으로 표시 */}
          {currentEvent?.mainImageUrl ? (
            <div className="w-full h-48 relative">
              <img
                src={currentEvent.mainImageUrl}
                alt={currentEvent.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // 이미지 로드 실패 시 기본 디자인으로 대체
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget
                    .nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.classList.remove('hidden');
                  }
                }}
              />

              {/* 이미지 로드 실패 시 기본 디자인 */}
              <div className="hidden w-full h-full bg-gradient-to-r from-orange-400 to-orange-500 absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">
                    {currentEvent.title}
                  </h2>
                </div>
              </div>

              {/* 이미지 위 어두운 오버레이 */}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />

              {/* 텍스트 오버레이 */}
              <div className="absolute inset-0 flex items-end">
                <div className="p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">
                    {currentEvent.title}
                  </h2>
                  <p className="text-sm opacity-90">
                    {new Date(currentEvent.createdAt).toLocaleDateString(
                      'ko-KR',
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* 기본 스타일 (이미지 없는 경우) */
            <div className="w-full h-48 bg-gradient-to-r from-orange-400 to-orange-500 relative flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {currentEvent?.title || '이벤트'}
                </h2>
                <p className="text-sm opacity-90">
                  {currentEvent?.createdAt &&
                    new Date(currentEvent.createdAt).toLocaleDateString(
                      'ko-KR',
                    )}
                </p>
              </div>

              {/* 기본 그라데이션 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          )}

          {/* 이벤트 보기 표시 */}
          {events.length > 0 &&
            currentEvent?.eventId &&
            currentEvent.eventId > 0 && (
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-medium">
                  이벤트 보기
                </span>
              </div>
            )}
        </button>

        {/* 네비게이션 버튼들 (여러 이벤트가 있을 때만 표시) */}
        {displayEvents.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white/90 transition-all z-20 hover:scale-110"
              aria-label="이전 이벤트"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white/90 transition-all z-20 hover:scale-110"
              aria-label="다음 이벤트"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}

        {/* 현재 이벤트 번호 표시 (여러 이벤트가 있을 때만) */}
        {displayEvents.length > 1 && (
          <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 z-30">
            <span className="text-white text-sm font-medium">
              {currentEventIndex + 1} / {displayEvents.length}
            </span>
          </div>
        )}
      </div>

      {/* 인디케이터 (여러 이벤트가 있을 때만 표시) */}
      {displayEvents.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {displayEvents.map((_, index) => (
            <button
              key={index}
              onClick={(e) => handleIndicatorClick(e, index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentEventIndex
                  ? 'bg-orange-500 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400 hover:scale-110'
              }`}
              aria-label={`${index + 1}번째 이벤트로 이동`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
