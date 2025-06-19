import React from 'react';
import { RESERVATION_STATUS_LABELS } from '@/constants/status';
import { SERVICE_TYPE_LABELS, SERVICE_TYPES } from '@/constants/service';
import { formatDateTime, formatPrice } from '@/utils';
import type { ReservationListResponse } from '@/types/reservation';

interface ReservationCardProps {
  reservation: ReservationListResponse;
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
              {
                SERVICE_TYPE_LABELS[
                  reservation.serviceType as keyof typeof SERVICE_TYPES
                ]
              }{' '}
              &gt; {reservation.detailServiceType}
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

export default ReservationCard;
