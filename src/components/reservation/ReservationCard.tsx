import React from 'react';
import type { ReservationResponseDto } from '@/apis/reservation';
import { RESERVATION_STATUS, RESERVATION_STATUS_LABELS, RESERVATION_STATUS_COLORS } from '@/constants';
import { BUTTON_TEXTS } from '@/constants';
import { formatDateTime } from '@/utils';

interface ReservationCardProps {
  reservation: ReservationResponseDto;
  onClick?: () => void;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({ reservation, onClick }) => {
  const getStatusBadgeStyle = (status: keyof typeof RESERVATION_STATUS) => {
    return {
      backgroundColor: RESERVATION_STATUS_COLORS[status] || '#9E9E9E',
      color: 'white',
    };
  };

  const getStatusLabel = (status: keyof typeof RESERVATION_STATUS) => {
    return RESERVATION_STATUS_LABELS[status] || '알 수 없음';
  };

  const renderActionButton = () => {
    switch (reservation.status as keyof typeof RESERVATION_STATUS) {
      case RESERVATION_STATUS.COMPLETED:
        return (
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600">
            {BUTTON_TEXTS.WRITE_REVIEW}
          </button>
        );
      case RESERVATION_STATUS.PENDING:
      case RESERVATION_STATUS.APPROVED:
        return (
          <button className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600">
            {BUTTON_TEXTS.CANCEL_RESERVATION}
          </button>
        );
      default:
        return (
          <button className="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded hover:bg-gray-600">
            {BUTTON_TEXTS.VIEW_MORE}
          </button>
        );
    }
  };

  return (
    <div 
      className="w-full p-4 mb-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold">{reservation.serviceType}</h3>
          <p className="text-sm text-gray-600">{reservation.detailServiceType}</p>
        </div>
        <span 
          className="px-3 py-1 text-sm font-medium rounded-full"
          style={getStatusBadgeStyle(reservation.status as keyof typeof RESERVATION_STATUS)}
        >
          {getStatusLabel(reservation.status as keyof typeof RESERVATION_STATUS)}
        </span>
      </div>
      
      <div className="mt-4 space-y-2">
        <p className="text-sm text-gray-600">
          예약일시: {formatDateTime(reservation.reservationDate)}
        </p>
        <p className="text-sm text-gray-600">
          서비스 시간: {reservation.startTime} - {reservation.endTime}
        </p>
        <p className="text-sm font-medium">
          결제 금액: {Number(reservation.totalPrice).toLocaleString()}원
        </p>
      </div>

      <div className="mt-4 flex justify-end">
        {renderActionButton()}
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