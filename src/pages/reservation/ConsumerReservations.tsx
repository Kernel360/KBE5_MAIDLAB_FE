import React, { useEffect, useState } from 'react';
import { useReservation } from '@/hooks/useReservation';
import { usePagination } from '@/hooks/usePagination';
import { ReservationCard } from '@/components/reservation/ReservationCard';
import type { ReservationResponseDto } from '@/apis/reservation';
import { useNavigate } from 'react-router-dom';

const ConsumerReservations: React.FC = () => {
  const navigate = useNavigate();
  const { reservations, loading, fetchReservations } = useReservation();
  const [filteredReservations, setFiltereredReservations] = useState<ReservationResponseDto[]>([]);
  const [activeTab, setActiveTab] = useState<'전체' | '예정' | '완료'>('전체');

  const { currentPage, totalPages, goToPage } = usePagination({
    totalItems: filteredReservations.length,
    itemsPerPage: 5
  });

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  useEffect(() => {
    if (reservations) {
      let filtered = [...reservations];
      if (activeTab === '예정') {
        filtered = reservations.filter(r => ['PENDING', 'CONFIRMED'].includes(r.status));
      } else if (activeTab === '완료') {
        filtered = reservations.filter(r => ['COMPLETED', 'CANCELLED'].includes(r.status));
      }
      setFiltereredReservations(filtered);
    }
  }, [reservations, activeTab]);

  const handleReservationClick = (reservationId: number) => {
    navigate(`/reservation/${reservationId}`);
  };

  const startIndex = currentPage * 5;
  const endIndex = startIndex + 5;
  const currentReservations = filteredReservations.slice(startIndex, endIndex);

  if (loading) {
    return <div className="p-4 text-center">로딩 중...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">예약 내역</h1>
      
      {/* 탭 메뉴 */}
      <div className="flex border-b mb-4">
        {['전체', '예정', '완료'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 ${
              activeTab === tab
                ? 'border-b-2 border-orange-500 text-orange-500'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab(tab as typeof activeTab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 예약 목록 */}
      <div className="space-y-4">
        {currentReservations.length > 0 ? (
          currentReservations.map((reservation) => (
            <ReservationCard
              key={reservation.reservationId}
              reservation={reservation}
              onClick={() => handleReservationClick(reservation.reservationId)}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            예약 내역이 없습니다.
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={`w-8 h-8 rounded ${
                currentPage === i
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsumerReservations; 