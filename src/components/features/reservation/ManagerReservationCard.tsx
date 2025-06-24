import React from 'react';
import {
  RESERVATION_STATUS,
  RESERVATION_STATUS_LABELS,
} from '@/constants/status';
import { SERVICE_TYPE_LABELS, SERVICE_TYPES } from '@/constants/service';
import { formatDateTime, formatPrice } from '@/utils';
import type { ReservationListResponse } from '@/types/reservation';

interface ManagerReservationCardProps {
  reservation: ReservationListResponse;
  getStatusBadgeStyle: (status: string, reservationDate: string) => string;
  onDetailClick: () => void;
  onCheckIn?: () => void;
  onCheckOut?: () => void;
  onCancel?: () => void;
}

export const ManagerReservationCard: React.FC<ManagerReservationCardProps> = ({
  reservation,
  getStatusBadgeStyle,
  onDetailClick,
  onCheckIn,
  onCheckOut,
  onCancel,
}) => {
  // 오늘 날짜인지 확인
  const isToday = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // 체크인 버튼 표시 여부
  const showCheckInButton =
    reservation.status === RESERVATION_STATUS.MATCHED &&
    isToday(reservation.reservationDate);

  // 체크아웃 버튼 표시 여부
  const showCheckOutButton = reservation.status === RESERVATION_STATUS.WORKING;

  // 예약취소 버튼 표시 여부
  const showCancelButton = reservation.status === RESERVATION_STATUS.MATCHED && !isToday(reservation.reservationDate);

  // 상태 텍스트 변환
  const getStatusText = (status: string, reservationDate: string) => {
    if (status === RESERVATION_STATUS.MATCHED) {
      if (isToday(reservationDate)) {
        return '오늘';
      }
      return '예정';
    }
    return RESERVATION_STATUS_LABELS[
      status as keyof typeof RESERVATION_STATUS_LABELS
    ];
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 mb-4 border border-gray-100">
      <div className="flex justify-between items-center mb-3">
        <span
          className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusBadgeStyle(reservation.status, reservation.reservationDate)}`}
        >
          {getStatusText(reservation.status, reservation.reservationDate)}
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
        {showCheckInButton && (
          <button
            onClick={onCheckIn}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold"
          >
            체크인
          </button>
        )}
        {showCheckOutButton && (
          <button
            onClick={onCheckOut}
            className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold"
          >
            체크아웃
          </button>
        )}
        {showCancelButton && onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm bg-red-100 text-red-500 border border-red-300 rounded-lg hover:bg-red-200 font-bold"
          >
            예약취소
          </button>
        )}
        <button
          onClick={onDetailClick}
          className="px-4 py-2 text-sm text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-50 font-bold"
        >
          상세보기
        </button>
      </div>
    </div>
  );
};
