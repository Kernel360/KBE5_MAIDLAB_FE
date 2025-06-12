import React from 'react';
import { RESERVATION_STATUS_LABELS } from '@/constants/status';
import { SERVICE_TYPE_LABELS, SERVICE_TYPES } from '@/constants/service';
import { formatDateTime, formatPrice } from '@/utils';
import type { ReservationResponseDto } from '@/apis/reservation';

interface ReservationCardProps {
  reservation: ReservationResponseDto;
  getStatusBadgeStyle: (status: string) => string;
  onClick?: () => void;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  getStatusBadgeStyle,
  onClick,
}) => {
  return (
    <div 
      className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <span
            className={`px-3 py-1 text-sm rounded-full ${getStatusBadgeStyle(reservation.status)}`}
          >
            {RESERVATION_STATUS_LABELS[reservation.status]}
          </span>
          <span className="ml-2 text-gray-500">
            #{reservation.reservationId}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          {formatDateTime(reservation.reservationDate)}
        </div>
      </div>

      <div className="border-t border-b border-gray-100 py-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">
              {SERVICE_TYPE_LABELS[reservation.serviceType as keyof typeof SERVICE_TYPES]} &gt;{' '}
              {reservation.detailServiceType}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {reservation.startTime} ~ {reservation.endTime}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium">
              {formatPrice(reservation.totalPrice)}원
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onClick}
          className="px-4 py-2 text-sm text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-50"
        >
          상세보기
        </button>
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