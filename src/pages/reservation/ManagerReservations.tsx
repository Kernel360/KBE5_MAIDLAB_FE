import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReservationListResponse } from '@/types/reservation';
import { useReservation } from '@/hooks/domain/useReservation';
import { formatDateTime } from '@/utils';
import { SUCCESS_MESSAGES } from '@/constants/message';
import { useReservationStatus } from '@/hooks/useReservationStatus';
import { ManagerReservationCard } from '@/components/features/reservation/ManagerReservationCard';

const ITEMS_PER_PAGE = 10;

interface CheckInOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isCheckIn: boolean;
  reservationInfo: {
    serviceType: string;
    detailServiceType: string;
    time: string;
  };
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCheckIn: boolean;
}

const CheckInOutModal: React.FC<CheckInOutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isCheckIn,
  reservationInfo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-4">
            서비스를 {isCheckIn ? '시작' : '종료'}하시겠습니까?
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="font-medium">
              {reservationInfo.serviceType} →{' '}
              {reservationInfo.detailServiceType}
            </p>
            <p className="text-gray-600 text-sm mt-1">{reservationInfo.time}</p>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600"
            >
              {isCheckIn ? '체크인' : '체크아웃'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  isCheckIn,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-4">
            {isCheckIn
              ? SUCCESS_MESSAGES.CHECKIN_SUCCESS
              : SUCCESS_MESSAGES.CHECKOUT_SUCCESS}
          </h3>
          <button
            onClick={onClose}
            className="px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

const ManagerReservations: React.FC = () => {
  const navigate = useNavigate();
  const { fetchReservations, checkIn, checkOut, reservations } =
    useReservation();
  const {
    loading: reservationStatusLoading,
    setLoading: setReservationStatusLoading,
    activeTab,
    setActiveTab: setReservationStatusActiveTab,
    filterReservationsByTab,
    getStatusBadgeStyle,
  } = useReservationStatus();
  const [currentPage, setCurrentPage] = useState(1);
  const [checkInOutModal, setCheckInOutModal] = useState<{
    isOpen: boolean;
    isCheckIn: boolean;
    reservationId: number | null;
    reservationInfo: {
      serviceType: string;
      detailServiceType: string;
      time: string;
    };
  }>({
    isOpen: false,
    isCheckIn: true,
    reservationId: null,
    reservationInfo: {
      serviceType: '',
      detailServiceType: '',
      time: '',
    },
  });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    isCheckIn: boolean;
  }>({
    isOpen: false,
    isCheckIn: true,
  });

  useEffect(() => {
    const getReservations = async () => {
      try {
        setReservationStatusLoading(true);
        await fetchReservations();
      } catch (error) {
        console.error('예약 목록 조회 실패:', error);
      } finally {
        setReservationStatusLoading(false);
      }
    };

    getReservations();
  }, [fetchReservations, setReservationStatusLoading]);

  const handleCheckInOutClick = (
    reservation: ReservationListResponse,
    isCheckIn: boolean,
  ) => {
    setCheckInOutModal({
      isOpen: true,
      isCheckIn,
      reservationId: reservation.reservationId,
      reservationInfo: {
        serviceType: reservation.serviceType,
        detailServiceType: reservation.detailServiceType,
        time: `${formatDateTime(reservation.reservationDate)} ${reservation.startTime} ~ ${reservation.endTime}`,
      },
    });
  };

  const handleCheckInOut = async () => {
    if (!checkInOutModal.reservationId) return;

    const currentTime = new Date().toISOString();
    try {
      if (checkInOutModal.isCheckIn) {
        await checkIn(checkInOutModal.reservationId, {
          checkTime: currentTime,
        });
      } else {
        await checkOut(checkInOutModal.reservationId, {
          checkTime: currentTime,
        });
      }
      setCheckInOutModal((prev) => ({ ...prev, isOpen: false }));
      setConfirmModal({
        isOpen: true,
        isCheckIn: checkInOutModal.isCheckIn,
      });
      await fetchReservations();
    } catch (error) {
      console.error('체크인/아웃 처리 실패:', error);
    }
  };

  const handleConfirmModalClose = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    if (!checkInOutModal.isCheckIn && checkInOutModal.reservationId) {
      // 체크아웃 후에만 리뷰 작성 페이지로 이동
      navigate(
        `/managers/reservations/${checkInOutModal.reservationId}/review`,
      );
    }
  };

  const filteredReservations = filterReservationsByTab(reservations);

  // 페이징 처리
  const totalPages = Math.ceil(filteredReservations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReservations = filteredReservations.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  if (reservationStatusLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">예약 일정</h1>

        {/* 탭 */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setReservationStatusActiveTab('scheduled')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'scheduled'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-500'
            }`}
          >
            예정
          </button>
          <button
            onClick={() => setReservationStatusActiveTab('today')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'today'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-500'
            }`}
          >
            오늘
          </button>
          <button
            onClick={() => setReservationStatusActiveTab('completed')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'completed'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-500'
            }`}
          >
            완료
          </button>
        </div>

        {/* 예약 목록 */}
        <div className="space-y-4">
          {filteredReservations.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              예약이 없습니다.
            </div>
          ) : (
            paginatedReservations.map((reservation) => (
              <ManagerReservationCard
                key={reservation.reservationId}
                reservation={reservation}
                getStatusBadgeStyle={(status) =>
                  getStatusBadgeStyle(status, reservation.reservationDate)
                }
                onDetailClick={() =>
                  navigate(
                    `/managers/reservations/${reservation.reservationId}`,
                  )
                }
                onCheckIn={() => handleCheckInOutClick(reservation, true)}
                onCheckOut={() => handleCheckInOutClick(reservation, false)}
              />
            ))
          )}
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

      {/* 모달 */}
      <CheckInOutModal
        isOpen={checkInOutModal.isOpen}
        onClose={() =>
          setCheckInOutModal((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={handleCheckInOut}
        isCheckIn={checkInOutModal.isCheckIn}
        reservationInfo={checkInOutModal.reservationInfo}
      />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={handleConfirmModalClose}
        isCheckIn={confirmModal.isCheckIn}
      />
    </div>
  );
};

export default ManagerReservations;
