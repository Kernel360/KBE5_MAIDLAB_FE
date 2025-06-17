import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { useReservation } from '@/hooks/useReservation';
import { useReservationStatus } from '@/hooks/useReservationStatus';
import { formatDateTime, formatPrice } from '@/utils';
import { RESERVATION_STATUS_LABELS } from '@/constants/status';
import { SERVICE_TYPE_LABELS } from '@/constants/service';
import type { ReservationDetailResponseDto } from '@/apis/reservation';
import ReservationHeader from '@/components/features/consumer/ReservationHeader';
import {ManagerFooter} from '@/components/layout/BottomNavigation/BottomNavigation';

const ManagerReservationDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { fetchReservationDetail, checkIn, checkOut, fetchReservations, reservations } = useReservation();
  const { getStatusBadgeStyle, isCheckInAvailable, isCheckOutAvailable } = useReservationStatus();
  const [reservation, setReservation] = useState<ReservationDetailResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'checkIn' | 'checkOut'>('checkIn');

  useEffect(() => {
    const getReservationInfo = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [detailData] = await Promise.all([
          fetchReservationDetail(parseInt(id)),
          fetchReservations()
        ]);
        setReservation(detailData);
      } catch (error) {
        console.error('예약 정보 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    getReservationInfo();
  }, [id, fetchReservationDetail, fetchReservations]);

  const handleCheckInOut = async () => {
    if (!reservation || !id) return;
    
    const currentTime = new Date().toISOString();
    try {
      if (modalType === 'checkIn') {
        await checkIn(parseInt(id), { checkTime: currentTime });
      } else {
        await checkOut(parseInt(id), { checkTime: currentTime });
        navigate(`/manager/reservations/${id}/review`);
      }
      setShowModal(false);
      // 상태 업데이트를 위해 상세 정보 다시 조회
      const detailData = await fetchReservationDetail(parseInt(id));
      setReservation(detailData);
    } catch (error) {
      console.error('체크인/아웃 실패:', error);
    }
  };

  const getStatusButton = () => {
    if (!reservation) return null;

    const currentReservation = reservations?.find(r => r.reservationId === parseInt(id || ''));
    if (!currentReservation) return null;

    if (isCheckInAvailable(currentReservation)) {
      return (
        <button
          onClick={() => {
            setModalType('checkIn');
            setShowModal(true);
          }}
          className="w-full px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600"
        >
          체크인
        </button>
      );
    }

    if (isCheckOutAvailable(currentReservation)) {
      return (
        <button
          onClick={() => {
            setModalType('checkOut');
            setShowModal(true);
          }}
          className="w-full px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600"
        >
          체크아웃
        </button>
      );
    }

    if (currentReservation.status === 'COMPLETED') {
      return (
        <div className="w-full px-4 py-2 text-center text-gray-500 bg-gray-100 rounded-lg">
          서비스가 완료되었습니다
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;
  }

  if (!reservation) {
    return <div className="flex items-center justify-center min-h-screen">예약 정보를 찾을 수 없습니다.</div>;
  }

  const currentReservation = reservations?.find(r => r.reservationId === parseInt(id || ''));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ReservationHeader title="예약 상세" onBack={() => navigate(-1)} />
      <div className="flex-1 max-w-3xl mx-auto p-4 pt-16 pb-20">
        {/* 예약 정보 카드 */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* 상태 배지 */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <span className={`px-3 py-1 text-sm rounded-full ${
                currentReservation ? getStatusBadgeStyle(currentReservation.status, currentReservation.reservationDate) : ''
              }`}>
                {currentReservation ? RESERVATION_STATUS_LABELS[currentReservation.status] : ''}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {formatDateTime(reservation.reservationDate)}
            </div>
          </div>

          {/* 서비스 정보 */}
          <div className="border-t border-b border-gray-100 py-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">
                  {SERVICE_TYPE_LABELS[reservation.serviceType as keyof typeof SERVICE_TYPE_LABELS]} &gt;{' '}
                  {reservation.serviceDetailType}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {reservation.startTime} ~ {reservation.endTime}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatPrice(reservation.totalPrice)}원</p>
              </div>
            </div>
          </div>

          {/* 고객 정보 */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">고객 정보</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">이름</p>
                  <p className="mt-1">{reservation.managerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">연락처</p>
                  <p className="mt-1">{reservation.managerPhoneNumber}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 주소 정보 */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">주소</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p>{reservation.address}</p>
              <p className="text-sm text-gray-500 mt-1">{reservation.addressDetail}</p>
            </div>
          </div>

          {/* 요청사항 */}
          {reservation.specialRequest && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">요청사항</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p>{reservation.specialRequest}</p>
              </div>
            </div>
          )}

          {/* 상태 버튼 */}
          <div className="mt-6">
            {getStatusButton()}
          </div>
        </div>
      </div>
      <ManagerFooter />

      {/* 체크인/아웃 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">
              {modalType === 'checkIn' ? '체크인' : '체크아웃'} 확인
            </h2>
            <p className="mb-6">
              {modalType === 'checkIn'
                ? '서비스를 시작하시겠습니까?'
                : '서비스를 완료하시겠습니까?'}
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleCheckInOut}
                className="flex-1 px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerReservationDetail; 