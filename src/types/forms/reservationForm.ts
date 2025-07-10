// 예약 폼 데이터 타입
import type { HousingType, PetType } from '@/constants/service';

export interface ReservationFormData {
  serviceType: string;
  serviceDetailType: string;
  address: string;
  addressDetail: string;
  housingType: HousingType;
  reservationDate: string;
  startTime: string;
  endTime: string;
  pet: PetType;
  managerUuid?: string;
  chooseManager: boolean;
  lifeCleaningRoomIdx?: number;
  serviceOptions?: { id: string; count?: number }[];
  housingInformation: string;
  specialRequest: string;
  managerInfo?: {
    uuid: string;
    name: string;
    profileImage?: string;
    averageRate?: number;
    introduceText?: string;
  };
}
