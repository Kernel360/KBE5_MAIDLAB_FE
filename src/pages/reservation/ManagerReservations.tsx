import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReservationResponseDto, ReservationStatus } from '@/apis/reservation';
import { useReservation } from '@/hooks/useReservation';
import { formatDateTime } from '@/utils';

const ITEMS_PER_PAGE = 10;

const ManagerReservations: React.FC = () => {
  const navigate = useNavigate();
  const { fetchReservations, checkIn, checkOut, reservations, loading } = useReservation();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<ReservationStatus | 'ALL'>('ALL');

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleCheckInOut = async (reservationId: number, isCheckIn: boolean) => {
    const currentTime = new Date().toISOString();
    try {
      if (isCheckIn) {
        await checkIn(reservationId, { checkTime: currentTime });
      } else {
        await checkOut(reservationId, { checkTime: currentTime });
      }
      await fetchReservations();
    } catch (error) {
      console.error('체크인/아웃 처리 실패:', error);
    }
  };

  // 상태별 필터링
  const filteredReservations = reservations.filter((reservation) => {
    if (selectedStatus === 'ALL') return true;
    return reservation.status === selectedStatus;
  });

  // 페이징 처리
  const totalPages = Math.ceil(filteredReservations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReservations = filteredReservations.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">예약 일정</h1>
        </div>
      </div>

      {/* 탭 */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button 
              className={`px-1 py-4 ${
                selectedStatus === 'ALL' 
                  ? 'border-b-2 border-orange-500 text-orange-500' 
                  : 'text-gray-500'
              }`}
              onClick={() => setSelectedStatus('ALL')}
            >
              전체
            </button>
            <button 
              className={`px-1 py-4 ${
                selectedStatus === 'PENDING' 
                  ? 'border-b-2 border-orange-500 text-orange-500' 
                  : 'text-gray-500'
              }`}
              onClick={() => setSelectedStatus('PENDING')}
            >
              예정
            </button>
            <button 
              className={`px-1 py-4 ${
                selectedStatus === 'COMPLETED' 
                  ? 'border-b-2 border-orange-500 text-orange-500' 
                  : 'text-gray-500'
              }`}
              onClick={() => setSelectedStatus('COMPLETED')}
            >
              완료
            </button>
          </div>
        </div>
      </div>

      {/* 예약 목록 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {paginatedReservations.map((reservation) => (
            <div
              key={reservation.reservationId}
              className="bg-white rounded-lg shadow p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      reservation.status === 'IN_PROGRESS'
                        ? 'bg-green-100 text-green-800'
                        : reservation.status === 'COMPLETED'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {reservation.status === 'IN_PROGRESS'
                        ? '진행중'
                        : reservation.status === 'COMPLETED'
                        ? '완료'
                        : '예정'}
                    </span>
                  </div>
                  <h2 className="text-lg font-medium">
                    {reservation.serviceType} → {reservation.detailServiceType}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    날짜/시간: {formatDateTime(reservation.reservationDate)} {reservation.startTime} ~ {reservation.endTime}
                  </p>
                  <p className="text-gray-600">금액: {reservation.totalPrice} VND</p>
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => navigate(`/manager/reservations/${reservation.reservationId}`)}
                    className="px-4 py-2 text-sm text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-50"
                  >
                    상세보기
                  </button>
                  {reservation.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleCheckInOut(
                        reservation.reservationId,
                        reservation.status !== 'IN_PROGRESS'
                      )}
                      className={`px-4 py-2 text-sm text-white rounded-lg ${
                        reservation.status === 'IN_PROGRESS'
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {reservation.status === 'IN_PROGRESS' ? '체크아웃' : '체크인'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerReservations; 