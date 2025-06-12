import { useState, useEffect } from 'react';
import { useMatching } from '@/hooks/useMatching';
import { useReservation } from '@/hooks/useReservation';
import type { RequestMatchingListResponseDto } from '@/apis/matching';
import { IoArrowBack } from 'react-icons/io5';
import { formatDateTimeWithLocale, formatPrice } from '@/utils/format';
import { useNavigate } from 'react-router-dom';

const ManagerMatching = () => {
  const navigate = useNavigate();
  const { fetchMatchings } = useMatching();
  const { respondToReservation } = useReservation();
  const [matchings, setMatchings] = useState<RequestMatchingListResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatchings();
  }, []);

  const loadMatchings = async () => {
    setLoading(true);
    try {
      const result = await fetchMatchings();
      console.log("result:", result);
      setMatchings(result);
    } catch (error) {
      console.error('매칭 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (reservationId: number) => {
    try {
      const result = await respondToReservation(reservationId, { status: true });
      if (result.success) {
        setMatchings(prev => prev.filter(matching => matching.reservationId !== reservationId));
      }
    } catch (error) {
      console.error('예약 수락 실패:', error);
    }
  };

  const handleReject = async (reservationId: number) => {
    try {
      const result = await respondToReservation(reservationId, { status: false });
      if (result.success) {
        setMatchings(prev => prev.filter(matching => matching.reservationId !== reservationId));
      }
    } catch (error) {
      console.error('예약 거절 실패:', error);
    }
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    return {
      range: `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')} ~ ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`,
      hours
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-4">
        {/* 헤더 */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2"
          >
            <IoArrowBack className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold ml-2">예약 요청</h1>
        </div>

        {/* 매칭 목록 */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : matchings.length > 0 ? (
            matchings.map((matching) => {
              const { range, hours } = formatTimeRange(matching.startTime, matching.endTime);
              return (
                <div key={matching.reservationId} className="bg-white rounded-lg shadow p-6">
                  {/* 서비스 정보 */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">
                      {matching.detailServiceType} &gt; {matching.serviceType}
                    </h3>
                    <div className="text-gray-600 space-y-1">
                      <p>예약일: {formatDateTimeWithLocale(matching.reservationDate)}</p>
                      <p>서비스 시간: {range} ({hours}시간)</p>
                    </div>
                  </div>

                  {/* 위치 및 상세 정보 */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">서비스 정보</h3>
                    <div className="space-y-2">
                      <p>위치: {matching.address} {matching.addressDetail}</p>
                      <p>방 크기: {matching.roomSize}평</p>
                      <p>반려동물: {matching.pet === 'true' ? '있음' : '없음'}</p>
                    </div>
                  </div>

                  {/* 가격 정보 */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">가격 정보</h3>
                    <p className="text-lg font-bold text-orange-500">
                      {formatPrice(matching.totalPrice)}원
                    </p>
                  </div>

                  {/* 버튼 */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAccept(matching.reservationId)}
                      className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                      수락
                    </button>
                    <button
                      onClick={() => handleReject(matching.reservationId)}
                      className="flex-1 px-4 py-3 border border-red-500 text-red-500 rounded-lg hover:bg-red-50"
                    >
                      거절
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">새로운 예약 요청이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerMatching; 