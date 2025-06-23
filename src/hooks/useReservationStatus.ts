import { useState } from 'react';
import { RESERVATION_STATUS, RESERVATION_STATUS_COLORS } from '@/constants/status';
import type { ReservationListResponse } from '@/types/reservation';

export type ReservationTab = 'scheduled' | 'today' | 'completed';

export const useReservationStatus = () => {
  const [activeTab, setActiveTab] = useState<ReservationTab>('scheduled');

  const filterReservationsByTab = (
    reservations: ReservationListResponse[] | null,
  ) => {
    if (!reservations) return [];

    const today = new Date().toISOString().split('T')[0];

    switch (activeTab) {
      case 'scheduled':
        return reservations.filter(
          (reservation) =>
            reservation.reservationDate >= today &&
            (reservation.status === RESERVATION_STATUS.MATCHED ||
              reservation.status === RESERVATION_STATUS.WORKING),
        );
      case 'today':
        return reservations.filter(
          (reservation) =>
            reservation.reservationDate === today &&
            (reservation.status === RESERVATION_STATUS.MATCHED ||
              reservation.status === RESERVATION_STATUS.WORKING),
        );
      case 'completed':
        return reservations.filter(
          (reservation) => reservation.status === RESERVATION_STATUS.COMPLETED,
        );
      default:
        return [];
    }
  };

  const getStatusBadgeStyle = (status: string, reservationDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (status === RESERVATION_STATUS.COMPLETED) {
      return 'bg-gray-200 text-gray-600 border border-gray-300';
    }
    if (status === RESERVATION_STATUS.WORKING) {
      return 'bg-green-100 text-green-700 border border-green-300';
    }
    if (status === RESERVATION_STATUS.MATCHED) {
      if (reservationDate === today) {
        return 'bg-blue-100 text-blue-700 border border-blue-300';
      }
      return 'bg-orange-100 text-orange-700 border border-orange-300';
    }
    const color = RESERVATION_STATUS_COLORS[status as keyof typeof RESERVATION_STATUS_COLORS] || '#ccc';
    return `bg-[${color}] text-white`;
  };

  const isCheckInAvailable = (reservation: ReservationListResponse) => {
    const today = new Date().toISOString().split('T')[0];
    return (
      reservation.status === RESERVATION_STATUS.MATCHED &&
      reservation.reservationDate === today
    );
  };

  const isCheckOutAvailable = (reservation: ReservationListResponse) => {
    return reservation.status === RESERVATION_STATUS.WORKING;
  };

  return {
    activeTab,
    setActiveTab,
    filterReservationsByTab,
    getStatusBadgeStyle,
    isCheckInAvailable,
    isCheckOutAvailable,
  };
};
