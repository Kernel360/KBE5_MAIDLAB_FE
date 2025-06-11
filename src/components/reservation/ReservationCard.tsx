import React from 'react';
import type { ReservationResponseDto, ReservationStatus } from '@/apis/reservation';

interface ReservationCardProps {
  reservation: ReservationResponseDto;
  onClick?: () => void;
}

interface StatusBadge {
  text: string;
  className: string;
}

const STATUS_MAP: Record<ReservationStatus, StatusBadge> = {
  PENDING: { text: '예정', className: 'bg-[#4CAF50] text-white' },
  CONFIRMED: { text: '확정', className: 'bg-[#2196F3] text-white' },
  IN_PROGRESS: { text: '진행중', className: 'bg-[#FF9800] text-white' },
  COMPLETED: { text: '완료', className: 'bg-[#9E9E9E] text-white' },
  CANCELLED: { text: '취소', className: 'bg-[#F44336] text-white' },
};

const DEFAULT_STATUS: StatusBadge = { text: '알 수 없음', className: 'bg-gray-400 text-white' };

export const ReservationCard: React.FC<ReservationCardProps> = ({ reservation, onClick }) => {
  console.log('Reservation data:', reservation);
  console.log('Status:', reservation.status);
  console.log('Status badge:', STATUS_MAP[reservation.status] || DEFAULT_STATUS);

  const formatDate = (date: string) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekDay = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
    return `${year}년 ${month}월 ${day}일 (${weekDay})`;
  };

  const formatTime = (start: string, end: string) => {
    return `${start} ~ ${end}`;
  };

  const formatPrice = (price: string) => {
    return `${parseInt(price).toLocaleString()} 원`;
  };

  const badge = STATUS_MAP[reservation.status] || DEFAULT_STATUS;

  return (
    <div 
      className="bg-white rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-medium">{reservation.serviceType}</h3>
            <span className={`px-2 py-0.5 text-xs rounded-full ${badge.className}`}>
              {badge.text}
            </span>
          </div>
          <p className="text-sm text-gray-600">{reservation.detailServiceType}</p>
        </div>
        <p className="text-base font-medium text-[#FF9800]">
          {formatPrice(reservation.totalPrice)}
        </p>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" />
          <span>{formatDate(reservation.reservationDate)}</span>
        </div>
        <div className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4" />
          <span>{formatTime(reservation.startTime, reservation.endTime)}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {reservation.status === 'PENDING' && (
          <>
            <button className="flex-1 px-4 py-2 text-sm border border-[#FF9800] text-[#FF9800] rounded-lg hover:bg-[#FFF3E0]">
              상세보기
            </button>
            <button className="flex-1 px-4 py-2 text-sm border border-[#F44336] text-[#F44336] rounded-lg hover:bg-[#FFEBEE]">
              예약취소
            </button>
          </>
        )}
        {reservation.status === 'COMPLETED' && (
          <button className="flex-1 px-4 py-2 text-sm border border-[#FF9800] text-[#FF9800] rounded-lg hover:bg-[#FFF3E0]">
            상세보기
          </button>
        )}
      </div>
    </div>
  );
};

const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default ReservationCard; 