import type { ManagerVerificationStatus } from '@/constants/status';

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export type ManagerStatusFilter = ManagerVerificationStatus | 'ALL';

export type UserType = 'consumer' | 'manager';

export interface LocationState {
  previousTab?: number;
}

export interface TableRowData {
  id: number;
  uuid: string;
  name: string;
}

export interface ConsumerRowData extends TableRowData {
  phoneNumber: string;
}

export interface ManagerRowData extends TableRowData {
  averageRate?: number;
  isVerified?: ManagerVerificationStatus;
}