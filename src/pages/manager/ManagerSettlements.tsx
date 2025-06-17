import React, { useState, useEffect } from 'react';
import { useReservation } from '@/hooks/useReservation';
import { format, addWeeks, startOfWeek } from 'date-fns';
import { INFO_MESSAGES } from '@/constants/message';
import ReservationHeader from '@/components/features/consumer/ReservationHeader';
import {ManagerFooter} from '@/components/layout/BottomNavigation/BottomNavigation';

const getKoreanWeekRange = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // 월요일 시작
  const end = addWeeks(start, 1);
  return `${format(start, 'yyyy.MM.dd')} ~ ${format(addWeeks(start, 1), 'MM.dd')}`;
};

const ManagerSettlements: React.FC = () => {
  const { fetchWeeklySettlements } = useReservation();
  const [currentWeek, setCurrentWeek] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [settlements, setSettlements] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState<string>('0');
  const [loading, setLoading] = useState(false);

  const fetchData = async (week: Date) => {
    setLoading(true);
    const startDate = format(week, 'yyyy-MM-dd');
    const response = await fetchWeeklySettlements(startDate);

    if (response && response.data) {
      setSettlements(response.data.settlements || []);
      setTotalAmount(response.data.totalAmount || '0');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(currentWeek);
    // eslint-disable-next-line
  }, [currentWeek]);

  const handlePrevWeek = () => {
    setCurrentWeek((prev) => addWeeks(prev, -1));
  };
  const handleNextWeek = () => {
    setCurrentWeek((prev) => addWeeks(prev, 1));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ReservationHeader title="정산 내역" onBack={() => window.history.back()} />
      <div className="flex-1 max-w-3xl mx-auto p-6 pt-16 pb-20">
        <h1 className="text-2xl font-bold mb-2">주간 정산 내역</h1>
        <div className="flex items-center justify-between mb-6">
          <button onClick={handlePrevWeek} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">이전 주</button>
          <span className="font-semibold text-lg">{getKoreanWeekRange(currentWeek)}</span>
          <button onClick={handleNextWeek} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">다음 주</button>
        </div>
        <div className="mb-4 p-4 bg-orange-50 rounded-xl flex items-center justify-between">
          <span className="font-semibold text-gray-700">합계</span>
          <span className="text-2xl font-bold text-orange-500">{Number(totalAmount).toLocaleString()}원</span>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-400">{INFO_MESSAGES.LOADING}</div>
        ) : settlements.length === 0 ? (
          <div className="text-center py-12 text-gray-400">정산 내역이 없습니다.</div>
        ) : (
          <div className="space-y-4">
            {settlements.map((s: any) => (
              <div key={s.settlementId} className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 border border-gray-100">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 mb-1">{s.serviceDetailType}</div>
                  <div className="text-sm text-gray-500">유형: {s.serviceType === 'HOUSEKEEPING' ? '가사도우미' : '돌봄서비스'}</div>
                  <div className="text-sm text-gray-500">상태: {s.status}</div>
                </div>
                <div className="flex flex-col items-end min-w-[120px]">
                  <div className="text-gray-600 text-sm">플랫폼 수수료</div>
                  <div className="font-bold text-blue-500">{Number(s.platformFee).toLocaleString()}원</div>
                  <div className="text-gray-600 text-sm mt-2">정산 금액</div>
                  <div className="font-bold text-orange-500 text-lg">{Number(s.amount).toLocaleString()}원</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ManagerFooter />
    </div>
  );
};

export default ManagerSettlements; 