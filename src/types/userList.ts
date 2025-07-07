import type { ManagerVerificationStatus } from '@/constants/status';
import type { UserType } from '@/constants/user';

// Re-export UserType for backward compatibility
export type { UserType };

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export type ManagerStatusFilter = ManagerVerificationStatus | 'ALL';

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