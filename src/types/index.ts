// 기본 타입들
export type { ID, BaseEntity } from './common';
export type { ApiResponse, PaginationResponse, PaginationParams } from './api';

// 사용자 관련 핵심 타입들
export type { UserType, Gender } from '@/constants/user';
export type { BaseUser, Consumer, Manager, Admin } from './user';

// 인증 관련
export type {
  LoginRequest,
  LoginResponse,
  SignUpRequest,
  SocialLoginRequest,
  SocialSignUpRequest,
  AuthState,
} from './auth';

// 예약 관련 핵심 타입들
export type {
  ReservationCreateRequest,
  ReservationListResponse,
  ReservationDetailResponse,
} from './reservation';

// 매니저 관련
export type {
  ManagerProfileCreateRequest,
  ManagerProfileResponse,
  ManagerDetail,
} from './manager';

// 소비자 관련
export type {
  ConsumerProfileResponse,
  ConsumerMyPageResponse,
} from './consumer';

// 매칭 관련
export type {
  MatchingResponse,
  AvailableManager,
  MatchingStatus,
} from './matching';

// 게시판 관련
export type {
  BoardCreateRequest,
  BoardResponse,
  BoardDetailResponse,
} from './board';

// 이벤트 관련
export type {
  EventCreateRequest,
  EventListResponse,
  EventDetailResponse,
} from './event';

// 관리자 관련
export type {
  AdminLoginRequest,
  ManagerListResponse,
  AdminManagerDetail,
} from './admin';
