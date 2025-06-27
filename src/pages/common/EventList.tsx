import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowLeft,
} from 'lucide-react';
import { useEvent } from '@/hooks/domain/useEvent';
import { usePagination } from '@/hooks/usePagination';
import { formatDate } from '@/utils';
import { ROUTES, INFO_MESSAGES } from '@/constants';
import type { EventListItem } from '@/types/event';

const EventList: React.FC = () => {
  const navigate = useNavigate();
  const { events, loading } = useEvent();
  const [searchKeyword, setSearchKeyword] = useState('');

  // 검색 필터링
  const filteredEvents = React.useMemo(() => {
    if (!searchKeyword.trim()) return events;

    return events.filter((event) =>
      event.title.toLowerCase().includes(searchKeyword.toLowerCase()),
    );
  }, [events, searchKeyword]);

  // 페이지네이션 (5개씩)
  const {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    hasNext,
    hasPrevious,
    goToPage,
    goToNext,
    goToPrevious,
  } = usePagination({
    totalItems: filteredEvents.length,
    itemsPerPage: 5,
    initialPage: 0,
  });

  // 현재 페이지에 표시할 이벤트들
  const currentEvents = filteredEvents.slice(startIndex, endIndex);

  // 뒤로가기
  const handleBack = () => {
    navigate(ROUTES.HOME);
  };

  // 이벤트 상세로 이동
  const handleEventClick = (eventId: number) => {
    navigate(`/events/${eventId}`);
  };

  // 검색 처리
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 검색 시 첫 페이지로 이동
    goToPage(0);
  };

  // 검색 초기화
  const handleClearSearch = () => {
    setSearchKeyword('');
    goToPage(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
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
            이벤트
          </h1>

          <div className="w-10"></div>
        </div>
      </header>

      <main className="px-4 py-6 pb-20">
        <div className="max-w-md mx-auto">
          {/* 검색바 */}
          <div className="mb-6">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="이벤트 검색..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </form>
          </div>

          {/* 로딩 상태 */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">{INFO_MESSAGES.LOADING}</p>
              </div>
            </div>
          )}

          {/* 검색 결과 없음 */}
          {!loading && filteredEvents.length === 0 && searchKeyword && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                검색 결과가 없습니다
              </h3>
              <p className="text-gray-600 text-center mb-4">
                '{searchKeyword}'와(과) 일치하는 이벤트를 찾을 수 없습니다.
              </p>
              <button
                onClick={handleClearSearch}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                전체 이벤트 보기
              </button>
            </div>
          )}

          {/* 이벤트 없음 */}
          {!loading && events.length === 0 && !searchKeyword && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                등록된 이벤트가 없습니다
              </h3>
              <p className="text-gray-600 text-center">
                새로운 이벤트가 등록되면 알려드릴게요.
              </p>
            </div>
          )}

          {/* 이벤트 리스트 */}
          {!loading && currentEvents.length > 0 && (
            <div className="space-y-4">
              {currentEvents.map((event) => (
                <EventCard
                  key={event.eventId}
                  event={event}
                  onClick={() => handleEventClick(event.eventId)}
                />
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {!loading && filteredEvents.length > 5 && (
            <div className="flex items-center justify-center pt-8">
              <div className="flex items-center space-x-2">
                {/* 이전 버튼 */}
                <button
                  onClick={goToPrevious}
                  disabled={!hasPrevious}
                  className={`p-2 rounded-lg border transition-colors ${
                    hasPrevious
                      ? 'border-gray-300 hover:border-orange-500 hover:text-orange-500'
                      : 'border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* 페이지 번호들 */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => goToPage(index)}
                      className={`w-10 h-10 rounded-lg transition-colors ${
                        currentPage === index
                          ? 'bg-orange-500 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                {/* 다음 버튼 */}
                <button
                  onClick={goToNext}
                  disabled={!hasNext}
                  className={`p-2 rounded-lg border transition-colors ${
                    hasNext
                      ? 'border-gray-300 hover:border-orange-500 hover:text-orange-500'
                      : 'border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* 페이지 정보 */}
          {!loading && filteredEvents.length > 0 && (
            <div className="text-center pt-4">
              <p className="text-sm text-gray-500">
                {startIndex + 1}-{endIndex} / 총 {filteredEvents.length}개
                이벤트
                {searchKeyword && ` (검색: ${searchKeyword})`}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// 이벤트 카드 컴포넌트
interface EventCardProps {
  event: EventListItem;
  onClick: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md hover:border-orange-200 transition-all cursor-pointer"
    >
      <div className="flex space-x-4">
        {/* 이벤트 이미지 */}
        <div className="flex-shrink-0">
          {event.mainImageUrl ? (
            <div className="w-20 h-20 rounded-xl overflow-hidden">
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
              <div className="hidden w-full h-full bg-gradient-to-br from-orange-400 to-orange-500 items-center justify-center">
                <Calendar className="w-8 h-8 text-white opacity-80" />
              </div>
            </div>
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-8 h-8 text-white opacity-80" />
            </div>
          )}
        </div>

        {/* 이벤트 정보 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base line-clamp-2 mb-2">
            {event.title}
          </h3>

          <div className="flex items-center text-sm text-gray-500 mb-1">
            <Clock className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span>{formatDate(event.createdAt)} 등록</span>
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
              이벤트
            </span>

            <div className="text-right">
              <span className="text-xs text-gray-400">자세히 보기</span>
              <div className="text-orange-500">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventList;
