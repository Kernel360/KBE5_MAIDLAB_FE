import { useState } from 'react';
import { RESERVATION_STATUS } from '@/constants/status';
import type {
  ReservationListResponse,
  ReservationTab,
} from '@/types/domain/reservation';

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

  const getReservationStatusLabel = (
    status: string,
    reservationDate: string,
  ) => {
    const today = new Date().toISOString().split('T')[0];

    if (status === RESERVATION_STATUS.COMPLETED) {
      return 'COMPLETED';
    }
    if (status === RESERVATION_STATUS.WORKING) {
      return 'WORKING';
    }
    if (status === RESERVATION_STATUS.MATCHED) {
      if (reservationDate === today) {
        return 'D_DAY';
      }
      return 'SCHEDULED';
    }

    return status.toUpperCase();
  };

  const isCheckInAvailable = (reservation: ReservationListResponse) => {
    const today = new Date().toISOString().split('T')[0];
    return (
      reservation.status === RESERVATION_STATUS.PAID &&
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
    getReservationStatusLabel,
    isCheckInAvailable,
    isCheckOutAvailable,
  };
};
