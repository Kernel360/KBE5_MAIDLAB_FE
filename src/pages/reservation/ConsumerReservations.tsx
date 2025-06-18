import React, { useEffect, useState } from 'react';
import { useReservation } from '@/hooks/useReservation';
import { usePagination } from '@/hooks/usePagination';
import { ReservationCard } from '@/components/reservation/ReservationCard';
import { ROUTES, RESERVATION_STATUS, PAGINATION_DEFAULTS, INFO_MESSAGES } from '@/constants';
import { IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import type { ReservationResponseDto } from '@/apis/reservation';
import ReservationHeader from '@/components/features/consumer/ReservationHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation/BottomNavigation';
import { useAuth } from '@/hooks/useAuth';

// Single Responsibility: 탭 관련 상수와 타입을 분리
type TabType = '전체' | '예정' | '진행중' | '완료';
const TABS: TabType[] = ['전체', '예정', '진행중', '완료'];

// Open-Closed: 상태 필터링 로직을 확장 가능하게 구성
const RESERVATION_FILTERS = {
  전체: (reservations: ReservationResponseDto[]) => reservations,
  예정: (reservations: ReservationResponseDto[]) => 
    reservations.filter(r => [
      RESERVATION_STATUS.PENDING,
      RESERVATION_STATUS.APPROVED,
      RESERVATION_STATUS.MATCHED,
    ].includes(r.status as "PENDING" | "APPROVED" | "MATCHED")),
  진행중: (reservations: ReservationResponseDto[]) =>
    reservations.filter(r => r.status === RESERVATION_STATUS.WORKING),
  완료: (reservations: ReservationResponseDto[]) => 
    reservations.filter(r => r.status === RESERVATION_STATUS.COMPLETED),
} as const;

const ConsumerReservations: React.FC = () => {
  const navigate = useNavigate();
  const { reservations, loading, fetchReservations } = useReservation();
  const [activeTab, setActiveTab] = useState<TabType>('전체');
  const [filteredReservations, setFilteredReservations] = useState<ReservationResponseDto[]>([]);
  const { isAuthenticated } = useAuth();

  const { currentPage, totalPages, goToPage, startIndex, endIndex } = usePagination({
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
    navigate(ROUTES.CONSUMER.RESERVATION_DETAIL.replace(':id', String(reservationId)));
  };

  const handleReviewClick = (reservationId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(ROUTES.CONSUMER.REVIEW_REGISTER.replace(':id', String(reservationId)));
  };

  const currentReservations = filteredReservations.slice(startIndex, endIndex);

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case RESERVATION_STATUS.COMPLETED:
        return 'bg-gray-100 text-gray-600';
      case RESERVATION_STATUS.WORKING:
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-orange-100 text-orange-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ReservationHeader title="예약 내역" onBack={() => navigate(-1)} />
      <div className="flex-1 max-w-3xl mx-auto p-4 pt-16 pb-20">
        {/* 탭 */}
        <div className="flex space-x-4 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg ${
                activeTab === tab
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 예약 목록 */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">{INFO_MESSAGES.LOADING}</p>
            </div>
          ) : currentReservations.length > 0 ? (
            <>
              {currentReservations.map((reservation) => (
                <div key={reservation.reservationId} className="relative">
                  <ReservationCard
                    key={reservation.reservationId}
                    reservation={reservation}
                    getStatusBadgeStyle={(status) => getStatusBadgeStyle(status)}
                    onClick={() => handleReservationClick(reservation.reservationId)}
                  />
                  {/* 리뷰 작성 버튼 */}
                  {!reservation.isExistReview && reservation.status === RESERVATION_STATUS.COMPLETED && (
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
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">{INFO_MESSAGES.NO_RESERVATIONS}</p>
            </div>
          )}
        </div>
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