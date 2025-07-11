import type { ServiceType } from '@/constants/service';

// 정산 관련 타입
export interface SettlementResponse {
  settlementId: number;
  reservationId: number;
  serviceType: ServiceType;
  serviceDetailType: string;
  status: string;
  platformFee: number;
  amount: number;
}

export interface WeeklySettlementResponse {
  totalAmount: number;
  settlements: SettlementResponse[];
}
