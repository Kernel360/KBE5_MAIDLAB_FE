import type {
  UserType,
  Gender,
  ManagerVerificationStatus,
  ServiceType,
} from '@/constants';

/**
 * 로그인 정보 저장 타입
 */
export interface SavedLoginInfo {
  phoneNumber: string;
  userType: UserType;
  rememberMe: boolean;
}

/**
 * 기본 사용자 정보
 */
export interface BaseUser {
  id: number;
  uuid: string;
  userType: UserType;
  phoneNumber: string;
  name: string;
  birth: string;
  gender: Gender;
  profileImage?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 소비자 정보
 */
export interface Consumer extends BaseUser {
  userType: 'CONSUMER';
  address?: string;
  detailAddress?: string;
  point: number;
}

/**
 * 매니저 정보
 */
export interface Manager extends BaseUser {
  userType: 'MANAGER';
  isVerified: ManagerVerificationStatus;
  averageRate: number;
  regions: string[];
  services: ServiceType[];
  schedules: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
  introduceText?: string;
  documents: Array<{
    fileType: string;
    fileName: string;
    uploadedFileUrl: string;
  }>;
}

/**
 * 관리자 정보
 */
export interface Admin extends BaseUser {
  userType: 'ADMIN';
  adminKey: string;
  permissions: string[];
}

/**
 * 사용자 마이페이지 정보 (공통)
 */
export interface UserMyPageInfo {
  userid: number;
  userType: UserType;
  profileImage?: string;
  name: string;
  isVerified?: boolean;
  point?: number;
}
