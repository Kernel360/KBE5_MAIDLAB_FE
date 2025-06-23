import React from 'react';
import { RESERVATION_STATUS_LABELS } from '@/constants/status';
import { SERVICE_TYPE_LABELS, SERVICE_TYPES } from '@/constants/service';
import { formatDateTime, formatPrice } from '@/utils';
import type { ReservationListResponse } from '@/types/reservation';

interface ReservationCardProps {
  reservation: ReservationListResponse;
  getStatusBadgeStyle: (status: string, reservationDate: string) => string;
  onClick?: () => void;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  getStatusBadgeStyle,
  onClick,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow p-6 mb-4 border border-gray-100 cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="flex justify-between items-center mb-3">
        <span
          className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusBadgeStyle(reservation.status, reservation.reservationDate)}`}
        >
          {RESERVATION_STATUS_LABELS[reservation.status]}
        </span>
      </div>
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-[#4B2E13] text-base">
            {SERVICE_TYPE_LABELS[reservation.serviceType as keyof typeof SERVICE_TYPES]}
          </span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-sm text-gray-600">{reservation.detailServiceType}</span>
        </div>
        <div className="flex flex-col gap-1 mt-2 text-sm">
          <div><span className="text-gray-400 w-12 inline-block">날짜</span> <span className="text-[#4B2E13] font-medium">{formatDateTime(reservation.reservationDate)}</span></div>
          <div><span className="text-gray-400 w-12 inline-block">시간</span> <span className="text-[#4B2E13] font-medium">{reservation.startTime} ~ {reservation.endTime}</span></div>
          <div><span className="text-gray-400 w-12 inline-block">금액</span> <span className="text-orange-500 font-bold">{formatPrice(reservation.totalPrice)}</span></div>
        </div>
      </div>
      <div className="flex gap-2 mt-3 justify-end">
        <button
          onClick={onClick}
          className="px-4 py-2 text-sm text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-50 font-bold"
        >
          상세보기
        </button>
      </div>
    </div>
  );
};

export default ReservationCard;
