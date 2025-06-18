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
}

export const ManagerReservationCard: React.FC<ManagerReservationCardProps> = ({
  reservation,
  getStatusBadgeStyle,
  onDetailClick,
  onCheckIn,
  onCheckOut,
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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <span
          className={`px-3 py-1 text-sm rounded-full ${getStatusBadgeStyle(reservation.status, reservation.reservationDate)}`}
        >
          {getStatusText(reservation.status, reservation.reservationDate)}
        </span>
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

      <div className="flex justify-end gap-2">
        {showCheckInButton && (
          <button
            onClick={onCheckIn}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            체크인
          </button>
        )}
        {showCheckOutButton && (
          <button
            onClick={onCheckOut}
            className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            체크아웃
          </button>
        )}
        <button
          onClick={onDetailClick}
          className="px-4 py-2 text-sm text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-50"
        >
          상세보기
        </button>
      </div>
    </div>
  );
};
