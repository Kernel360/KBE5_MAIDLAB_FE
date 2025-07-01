import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ROUTES } from '@/constants';
import { RESERVATION_STATUS } from '@/constants/status';
import type { ReservationItem } from '@/types/reservation';

interface ReservationCalendarProps {
  reservations: ReservationItem[];
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasReservation: boolean;
  dateString: string;
}

const ReservationCalendar: React.FC<ReservationCalendarProps> = ({
  reservations,
}) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  // 오늘 날짜
  const today = new Date();

  // 매니저 전용 예약 필터링
  const managerReservations = reservations.filter(
    (reservation) => reservation.status !== RESERVATION_STATUS.CANCELED,
  );

  // 캘린더 네비게이션
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // 오늘로 돌아가기
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 현재 표시 중인 달이 오늘이 포함된 달인지 확인
  const isCurrentMonth =
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth() === today.getMonth();

  // 캘린더 날짜 생성
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dateString = current.toISOString().split('T')[0];

      // 예정된 예약만 필터링 (완료/취소 제외)
      const hasUpcomingReservation = managerReservations.some(
        (reservation) =>
          reservation.reservationDate === dateString &&
          (reservation.status === RESERVATION_STATUS.MATCHED ||
            reservation.status === RESERVATION_STATUS.WORKING ||
            reservation.status === RESERVATION_STATUS.PENDING ||
            reservation.status === RESERVATION_STATUS.APPROVED),
      );

      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: current.toDateString() === today.toDateString(),
        hasReservation: hasUpcomingReservation,
        dateString,
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <section className="bg-white rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">예약 일정</h2>
        <button
          onClick={() => navigate(ROUTES.MANAGER.RESERVATIONS)}
          className="text-orange-500 text-sm font-medium"
        >
          전체보기
        </button>
      </div>

      {/* 캘린더 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </h3>
        <div className="flex items-center space-x-2">
          {/* 오늘 버튼 - 현재 달이 아닐 때만 표시 */}
          {!isCurrentMonth && (
            <button
              onClick={goToToday}
              className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium hover:bg-orange-200 transition-colors"
            >
              오늘
            </button>
          )}

          {/* 이전/다음 달 버튼 */}
          <div className="flex space-x-1">
            <button
              onClick={() => navigateMonth('prev')}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div key={day} className="h-8 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-500">{day}</span>
          </div>
        ))}
      </div>

      {/* 캘린더 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <button
            key={index}
            className={`
              h-10 flex items-center justify-center text-sm relative
              ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}
              ${day.isToday ? 'bg-orange-500 text-white rounded-full font-medium' : ''}
              ${day.hasReservation && !day.isToday ? 'bg-orange-100 rounded-full' : ''}
              hover:bg-gray-100 transition-colors
            `}
          >
            {day.date.getDate()}
            {day.hasReservation && !day.isToday && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-orange-500 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </section>
  );
};

export default ReservationCalendar;