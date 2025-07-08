import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowRight,
} from 'lucide-react';
import { useEvent } from '@/hooks/domain/useEvent';
import { usePagination } from '@/hooks/usePagination';
import { formatDate } from '@/utils';
import { ROUTES, INFO_MESSAGES } from '@/constants';
import type { EventListItem } from '@/types/event';
import { Header } from '@/components';

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
      <Header
        variant="sub"
        title="이벤트"
        backRoute={ROUTES.HOME}
        showMenu={true}
      />

      <main className="px-4 py-6 pb-20">
        <div className="max-w-md mx-auto">
          {/* 검색바 */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="이벤트 검색..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
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
            <div className="space-y-3">
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
            <div className="flex items-center justify-center gap-2 mt-6 mb-4">
              {/* 이전 페이지 버튼 */}
              <button
                onClick={goToPrevious}
                disabled={!hasPrevious}
                className={`p-2 rounded-lg ${
                  hasPrevious
                    ? 'bg-white border border-gray-200 hover:bg-gray-50'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* 페이지 번호 */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => goToPage(index)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      currentPage === index
                        ? 'bg-orange-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {/* 다음 페이지 버튼 */}
              <button
                onClick={goToNext}
                disabled={!hasNext}
                className={`p-2 rounded-lg ${
                  hasNext
                    ? 'bg-white border border-gray-200 hover:bg-gray-50'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
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
      className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-orange-200 transition-all cursor-pointer"
    >
      <div className="flex space-x-4">
        {/* 이벤트 이미지 */}
        <div className="flex-shrink-0">
          {event.mainImageUrl ? (
            <div className="w-16 h-16 rounded-xl overflow-hidden">
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
              <div className="hidden w-full h-full bg-orange-100 items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          ) : (
            <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          )}
        </div>

        {/* 이벤트 정보 */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-base line-clamp-2 mb-2 leading-tight">
              {event.title}
            </h3>

            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-2 flex-shrink-0 text-orange-400" />
              <span>{formatDate(event.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end mt-3">
            <div className="flex items-center text-orange-500">
              <span className="text-sm font-medium mr-1">전체보기</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventList;
