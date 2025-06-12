import { useState } from 'react';
import { RESERVATION_STATUS } from '@/constants/status';
import type { ReservationResponseDto } from '@/apis/reservation';

export type ReservationTab = 'scheduled' | 'today' | 'completed';

export const useReservationStatus = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ReservationTab>('scheduled');

  const filterReservationsByTab = (reservations: ReservationResponseDto[] | null) => {
    if (!reservations) return [];

    const today = new Date().toISOString().split('T')[0];
    
    switch (activeTab) {
      case 'scheduled':
        return reservations.filter(
          (reservation) =>
            reservation.reservationDate >= today &&
            reservation.status === RESERVATION_STATUS.MATCHED
        );
      case 'today':
        return reservations.filter(
          (reservation) =>
            reservation.reservationDate === today &&
            (reservation.status === RESERVATION_STATUS.MATCHED ||
             reservation.status === RESERVATION_STATUS.WORKING)
        );
      case 'completed':
        return reservations.filter(
          (reservation) => reservation.status === RESERVATION_STATUS.COMPLETED
        );
      default:
        return [];
    }
  };

  const getStatusBadgeStyle = (status: string, reservationDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    if (status === RESERVATION_STATUS.COMPLETED) {
      return 'bg-gray-100 text-gray-600';
    }
    if (reservationDate === today) {
      return 'bg-blue-100 text-blue-600';
    }
    return 'bg-orange-100 text-orange-600';
  };

  const isCheckInAvailable = (reservation: ReservationResponseDto) => {
    const today = new Date().toISOString().split('T')[0];
    return reservation.status === RESERVATION_STATUS.MATCHED && 
           reservation.reservationDate === today;
  };

  const isCheckOutAvailable = (reservation: ReservationResponseDto) => {
    return reservation.status === RESERVATION_STATUS.WORKING;
  };

  return {
    loading,
    setLoading,
    activeTab,
    setActiveTab,
    filterReservationsByTab,
    getStatusBadgeStyle,
    isCheckInAvailable,
    isCheckOutAvailable,
  };
}; 