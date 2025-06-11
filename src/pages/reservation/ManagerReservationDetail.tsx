import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import type { ReservationDetailResponseDto } from '@/apis/reservation';
import { useReservation } from '@/hooks/useReservation';
import { formatDateTime } from '@/utils';

const ManagerReservationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchReservationDetail, checkIn, checkOut } = useReservation();
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

  const handleCheckInOut = async (isCheckIn: boolean) => {
    if (!id || !reservation) return;
    
    const currentTime = new Date().toISOString();
    try {
      if (isCheckIn) {
        await checkIn(parseInt(id), { checkTime: currentTime });
      } else {
        await checkOut(parseInt(id), { checkTime: currentTime });
      }
      // 예약 정보 새로고침
      const updatedData = await fetchReservationDetail(parseInt(id));
      if (updatedData) {
        setReservation(updatedData);
      }
    } catch (error) {
      console.error('체크인/아웃 처리 실패:', error);
    }
  };

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
          <h1 className="ml-2 text-lg font-semibold">예약 상세</h1>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="pt-16 pb-4">
        {/* 예약 상태 */}
        <div className="bg-[#FFF8E7] p-4">
          <div className="text-center">
            <div className="inline-block px-3 py-1 bg-green-500 text-white rounded-full text-sm mb-2">
              오늘
            </div>
            <h2 className="text-lg font-medium">{reservation.serviceType} → {reservation.serviceDetailType}</h2>
            <p className="text-gray-600 text-sm mt-1">예약번호: ANT-20231016-001</p>
          </div>
        </div>

        {/* 예약 정보 */}
        <div className="bg-white px-4 py-5">
          <h3 className="text-lg font-medium mb-4">예약 정보</h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-500 text-sm">예약 일시</p>
              <p className="mt-1">{formatDateTime(reservation.reservationDate)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">서비스 시간</p>
              <p className="mt-1">3시간 ({reservation.startTime} ~ {reservation.endTime})</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">공간 크기</p>
              <p className="mt-1">{reservation.roomSize}평방미터 / {reservation.housingInformation}</p>
            </div>
            {reservation.serviceAdd && (
              <div>
                <p className="text-gray-500 text-sm">추가 서비스</p>
                <p className="mt-1">{reservation.serviceAdd}</p>
              </div>
            )}
          </div>
        </div>

        {/* 위치 정보 */}
        <div className="mt-2 bg-white px-4 py-5">
          <h3 className="text-lg font-medium mb-4">위치 정보</h3>
          <p>{reservation.address}</p>
          <p className="text-gray-500 mt-1">{reservation.addressDetail}</p>
        </div>

        {/* 결제 정보 */}
        <div className="mt-2 bg-white px-4 py-5">
          <h3 className="text-lg font-medium mb-4">결제 정보</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">기본 서비스 (3시간)</span>
              <span>180,000 VND</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">요리 추가 (+1시간)</span>
              <span>60,000 VND</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">성수기 할증료</span>
              <span>30,000 VND</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="font-medium">총 결제 금액</span>
              <span className="text-lg font-bold text-orange-500">{reservation.totalPrice} VND</span>
            </div>
          </div>
        </div>

        {/* 고객 요청사항 */}
        {reservation.specialRequest && (
          <div className="mt-2 bg-white px-4 py-5">
            <h3 className="text-lg font-medium mb-4">고객 요청사항</h3>
            <p className="text-gray-600">{reservation.specialRequest}</p>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <button
            onClick={() => handleCheckInOut(true)}
            className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg"
          >
            체크인
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerReservationDetail; 