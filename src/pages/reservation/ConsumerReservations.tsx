import React, { useEffect, useState } from 'react';
import { useReservation } from '@/hooks/useReservation';
import { usePagination } from '@/hooks/usePagination';
import { ReservationCard } from '@/components/reservation/ReservationCard';
import { ROUTES, RESERVATION_STATUS, PAGINATION_DEFAULTS, INFO_MESSAGES } from '@/constants';
import { IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import type { ReservationResponseDto } from '@/apis/reservation';

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

// Interface Segregation: 컴포넌트별 책임을 명확히 분리
const ReservationTabs: React.FC<{
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}> = ({ activeTab, onTabChange }) => (
  <div className="flex border-b">
    {TABS.map((tab) => (
      <button
        key={tab}
        className={`flex-1 py-3 text-sm font-medium border-b-2 ${
          activeTab === tab
            ? 'text-blue-600 border-blue-600'
            : 'text-gray-500 border-transparent'
        }`}
        onClick={() => onTabChange(tab)}
      >
        {tab}
      </button>
    ))}
  </div>
);

// Liskov Substitution: 예약 목록 표시 컴포넌트를 독립적으로 구성
const ReservationList: React.FC<{
  reservations: ReservationResponseDto[];
  onReservationClick: (id: number) => void;
}> = ({ reservations, onReservationClick }) => (
  <div className="space-y-4">
    {reservations.map((reservation) => (
      <ReservationCard
        key={reservation.reservationId}
        reservation={reservation}
        onClick={() => onReservationClick(reservation.reservationId)}
      />
    ))}
  </div>
);

// Dependency Inversion: 상위 컴포넌트에서 하위 컴포넌트로 의존성 주입
const ConsumerReservations: React.FC = () => {
  const navigate = useNavigate();
  const { reservations, loading, fetchReservations } = useReservation();
  const [activeTab, setActiveTab] = useState<TabType>('전체');
  const [filteredReservations, setFilteredReservations] = useState<ReservationResponseDto[]>([]);

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

  const currentReservations = filteredReservations.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow">
        <div className="flex items-center px-4 h-14">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2"
          >
            <IoArrowBack className="w-6 h-6" />
          </button>
          <h1 className="ml-2 text-lg font-semibold">예약 내역</h1>
        </div>
        <ReservationTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* 컨텐츠 */}
      <div className="pt-28 px-4 pb-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">{INFO_MESSAGES.LOADING}</p>
          </div>
        ) : currentReservations.length > 0 ? (
          <>
            <ReservationList
              reservations={currentReservations}
              onReservationClick={handleReservationClick}
            />
            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i)}
                    className={`w-8 h-8 rounded-full ${
                      currentPage === i
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-40">
            <p className="text-gray-500">{INFO_MESSAGES.NO_RESERVATIONS}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumerReservations; 