import React, { useEffect, useState } from 'react';
import { useReservation } from '@/hooks/useReservation';
import { usePagination } from '@/hooks/usePagination';
import type { ReservationResponseDto } from '@/apis/reservation';
import { useNavigate } from 'react-router-dom';
import { ROUTES, RESERVATION_STATUS, PAGINATION_DEFAULTS, INFO_MESSAGES } from '@/constants';
import { ReservationCard } from '@/components/reservation/ReservationCard';
import { IoArrowBack } from 'react-icons/io5';

type TabType = '전체' | '예정' | '완료';
const TABS: TabType[] = ['전체', '예정', '완료'];

const PENDING_STATUSES = [RESERVATION_STATUS.PENDING, RESERVATION_STATUS.APPROVED] as const;
const COMPLETED_STATUSES = [RESERVATION_STATUS.COMPLETED, RESERVATION_STATUS.CANCELED] as const;

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
      let filtered = [...reservations];
      if (activeTab === '예정') {
        filtered = reservations.filter(r => 
          PENDING_STATUSES.includes(r.status as typeof PENDING_STATUSES[number])
        );
      } else if (activeTab === '완료') {
        filtered = reservations.filter(r => 
          COMPLETED_STATUSES.includes(r.status as typeof COMPLETED_STATUSES[number])
        );
      }
      setFilteredReservations(filtered);
    }
  }, [reservations, activeTab]);

  const handleReservationClick = (reservationId: number) => {
    navigate(`${ROUTES.CONSUMER.RESERVATION_DETAIL.replace(':id', String(reservationId))}`);
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

        {/* 탭 메뉴 */}
        <div className="flex border-b">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-3 text-sm font-medium border-b-2 ${
                activeTab === tab
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="pt-28 px-4 pb-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">{INFO_MESSAGES.LOADING}</p>
          </div>
        ) : currentReservations.length > 0 ? (
          <>
            <div className="space-y-4">
              {currentReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.reservationId}
                  reservation={reservation}
                  onClick={() => handleReservationClick(reservation.reservationId)}
                />
              ))}
            </div>

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