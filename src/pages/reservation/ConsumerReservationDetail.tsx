import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReservation } from '@/hooks/useReservation';
import { IoArrowBack } from 'react-icons/io5';
import { SERVICE_TYPE_LABELS, SERVICE_TYPES } from '@/constants/service';
import { formatDateTime, formatPrice } from '@/utils';
import type { ReservationDetailResponseDto } from '@/apis/reservation';
import ReservationHeader from '@/components/features/consumer/ReservationHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation/BottomNavigation';
import { useAuth } from '@/hooks/useAuth';

const ConsumerReservationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchReservationDetail } = useReservation();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<ReservationDetailResponseDto | null>(null);

  useEffect(() => {
    const loadReservationDetail = async () => {
      try {
        if (!id) return;
        const data = await fetchReservationDetail(parseInt(id));
        if (!data) {
          throw new Error('예약 정보를 찾을 수 없습니다.');
        }
        setReservation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '예약 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadReservationDetail();
  }, [id, fetchReservationDetail]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-red-500 mb-4">{error || '예약 정보를 찾을 수 없습니다.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ReservationHeader title="예약 상세" onBack={() => navigate(-1)} />
      <div className="flex-1 max-w-3xl mx-auto p-4 pt-16 pb-20">
        {/* 예약 상태 */}
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <div className="text-center">
            <h2 className="text-lg font-medium">
              {SERVICE_TYPE_LABELS[reservation.serviceType as keyof typeof SERVICE_TYPES]} &gt; {reservation.serviceDetailType}
            </h2>
          </div>
        </div>

        {/* 예약 정보 */}
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h3 className="text-lg font-medium mb-4">예약 정보</h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-500 text-sm">예약 일시</p>
              <p className="mt-1">{formatDateTime(reservation.reservationDate)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">서비스 시간</p>
              <p className="mt-1">{reservation.startTime} ~ {reservation.endTime}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">공간 크기</p>
              <p className="mt-1">{reservation.roomSize}평방미터</p>
            </div>
            {reservation.specialRequest && (
              <div>
                <p className="text-gray-500 text-sm">추가 요청사항</p>
                <p className="mt-1">{reservation.specialRequest}</p>
              </div>
            )}
          </div>
        </div>

        {/* 도우미 정보 */}
        {reservation.managerName && (
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <h3 className="text-lg font-medium mb-4">도우미 정보</h3>
            <div className="flex items-center">
              <img
                src={reservation.managerProfileImageUrl || '/default-profile.png'}
                alt={reservation.managerName}
                className="w-16 h-16 rounded-full"
              />
              <div className="ml-4">
                <p className="font-medium">{reservation.managerName}</p>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-400">★</span>
                  <span className="ml-1">{reservation.managerAverageRate?.toFixed(1) || '0.0'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 위치 정보 */}
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h3 className="text-lg font-medium mb-4">위치 정보</h3>
          <p>{reservation.address}</p>
          <p className="text-gray-500 mt-1">{reservation.addressDetail}</p>
        </div>

        {/* 결제 정보 */}
        <div className="bg-white rounded-lg shadow p-6 mb-20">
          <h3 className="text-lg font-medium mb-4">결제 정보</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">서비스 금액</span>
              <span>{formatPrice(Number(reservation.totalPrice))}원</span>
            </div>
            {reservation.serviceAdd !== "NONE" && (
              <div className="flex justify-between">
                <span className="text-gray-500">추가 서비스</span>
                <span>{reservation.serviceAdd}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="font-medium">총 결제 금액</span>
              <span className="text-lg font-bold text-orange-500">{formatPrice(Number(reservation.totalPrice))}원</span>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <div className="max-w-3xl mx-auto flex gap-3">
            {reservation.managerPhoneNumber && (
              <button 
                className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                onClick={() => window.location.href = `tel:${reservation.managerPhoneNumber}`}
              >
                도우미 연락
              </button>
            )}
          </div>
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

export default ConsumerReservationDetail; 