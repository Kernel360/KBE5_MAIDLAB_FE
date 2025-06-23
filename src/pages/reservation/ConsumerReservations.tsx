import React, { useEffect, useState } from 'react';
import { useReservation } from '@/hooks/domain/useReservation';
import { usePagination } from '@/hooks/usePagination';
import { ReservationCard } from '@/components/features/reservation/ReservationCard';
import {
  ROUTES,
  RESERVATION_STATUS,
  PAGINATION_DEFAULTS,
  INFO_MESSAGES,
} from '@/constants';
import { useNavigate } from 'react-router-dom';
import type { ReservationListResponse } from '@/types/reservation';
import ReservationHeader from '@/components/features/consumer/ReservationHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation/BottomNavigation';
import { useAuth } from '@/hooks/useAuth';
import { useReservationStatus } from '@/hooks/useReservationStatus';

// Single Responsibility: 탭 관련 상수와 타입을 분리
type TabType = '전체' | '요청 대기중' | '예정' | '진행중' | '완료';
const TABS: TabType[] = ['전체', '요청 대기중', '예정', '진행중', '완료'];
const FILTERS = [
  { label: '전체', value: '전체' },
  { label: '요청 대기중', value: '요청 대기중' },
  { label: '예정', value: '예정' },
  { label: '진행중', value: '진행중' },
  { label: '완료', value: '완료' },
];

// Open-Closed: 상태 필터링 로직을 확장 가능하게 구성
const RESERVATION_FILTERS = {
  전체: (reservations: ReservationListResponse[]) => reservations,
  '요청 대기중': (reservations: ReservationListResponse[]) =>
    reservations.filter((r) => r.status === RESERVATION_STATUS.PENDING),
  예정: (reservations: ReservationListResponse[]) =>
    reservations.filter((r) => r.status === RESERVATION_STATUS.MATCHED),
  진행중: (reservations: ReservationListResponse[]) =>
    reservations.filter((r) => r.status === RESERVATION_STATUS.WORKING),
  완료: (reservations: ReservationListResponse[]) =>
    reservations.filter((r) => r.status === RESERVATION_STATUS.COMPLETED),
} as const;

const ConsumerReservations: React.FC = () => {
  const navigate = useNavigate();
  const { reservations, loading, fetchReservations } = useReservation();
  const [activeTab, setActiveTab] = useState<TabType>('전체');
  const [filteredReservations, setFilteredReservations] = useState<
    ReservationListResponse[]
  >([]);
  const { isAuthenticated } = useAuth();
  const { getStatusBadgeStyle } = useReservationStatus();

  const { currentPage, totalPages, goToPage, startIndex, endIndex } =
    usePagination({
      totalItems: filteredReservations.length,
      itemsPerPage: PAGINATION_DEFAULTS.SIZE,
    });

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  useEffect(() => {
    if (reservations) {
      const filterFn = RESERVATION_FILTERS[activeTab];
      setFilteredReservations(filterFn(reservations));
    }
  }, [reservations, activeTab]);

  const handleReservationClick = (reservationId: number) => {
    navigate(
      ROUTES.CONSUMER.RESERVATION_DETAIL.replace(':id', String(reservationId)),
    );
  };

  const handleReviewClick = (
    reservationId: number,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    navigate(
      ROUTES.CONSUMER.REVIEW_REGISTER.replace(':id', String(reservationId)),
    );
  };

  const currentReservations = filteredReservations.slice(startIndex, endIndex);

  return (
    <div className="max-w-md mx-auto bg-[#F7F7F7] min-h-screen p-0 pb-20 relative">
      {/* ReservationHeader를 absolute로 올리고, 탭 헤더에 pt-16 추가 */}
      <div className="absolute top-0 left-0 w-full z-20">
        <ReservationHeader title="예약 내역" onBack={() => navigate(-1)} />
      </div>
      {/* 탭 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 pt-16 pb-2 sticky top-0 z-10">
        <div className="flex gap-8">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`text-lg font-bold pb-2 border-b-2 ${activeTab === f.value ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'}`}
              onClick={() => setActiveTab(f.value as TabType)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="px-2 pt-4">
        {loading ? (
          <div className="text-center py-8 text-gray-400">{INFO_MESSAGES.LOADING}</div>
        ) : currentReservations.length > 0 ? (
          <>
            {currentReservations.map((reservation) => (
              <div key={reservation.reservationId} className="relative">
                <ReservationCard
                  reservation={reservation}
                  getStatusBadgeStyle={(status, reservationDate) => getStatusBadgeStyle(status, reservationDate)}
                  onClick={() => handleReservationClick(reservation.reservationId)}
                />
                {/* 리뷰 작성 버튼 */}
                {!reservation.isExistReview &&
                  reservation.status === RESERVATION_STATUS.COMPLETED && (
                    <button
                      onClick={(e) => handleReviewClick(reservation.reservationId, e)}
                      className="absolute bottom-6 right-6 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 shadow-md"
                    >
                      리뷰 작성
                    </button>
                  )}
              </div>
            ))}
            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i)}
                    className={`px-3 py-1 rounded ${
                      currentPage === i
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-400">{INFO_MESSAGES.NO_RESERVATIONS}</div>
        )}
      </div>
      <BottomNavigation
        activeTab="reservation"
        onTabClick={navigate}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
};

export default ConsumerReservations;
