// 인증 관련 타입 정의

import type { UserType } from '@/constants/user';
import type {
  LoginRequest,
  SignUpRequest,
  SocialLoginRequest,
  SocialSignUpRequest,
} from '@/types/domain/auth';

/**
 * 전역 로그아웃 핸들러 타입
 */
export type GlobalLogoutHandler = (() => void) | null;

/**
 * 인증 상태 타입
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userType: UserType | null;
  userInfo: any | null;
  error: string | null;
}

/**
 * 인증 액션 타입
 */
export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { userType: UserType; userInfo?: any } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_RESET_ERROR' };

/**
 * 소셜 로그인 응답 타입
 */
export interface SocialLoginResponse {
  success: boolean;
  newUser?: boolean;
  error?: string;
  accessToken?: string;
  profileCompleted?: boolean;
}

/**
 * 일반 인증 응답 타입
 */
export interface AuthResponse {
  success: boolean;
  error?: string;
}

/**
 * 인증 컨텍스트 타입
 */
export interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<AuthResponse>;
  socialLogin: (data: SocialLoginRequest) => Promise<SocialLoginResponse>;
  signUp: (data: SignUpRequest) => Promise<AuthResponse>;
  socialSignUp: (data: SocialSignUpRequest) => Promise<AuthResponse>;
  logout: () => void;
  resetError: () => void;
  changePassword: (password: string) => Promise<AuthResponse>;
  withdraw: () => Promise<AuthResponse>;
  canAccessPage: (requiredUserType?: string) => boolean;
  isConsumer: () => boolean;
  isManager: () => boolean;
}

/**
 * 인증 프로바이더 프로퍼티 타입
 */
export interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * 소셜 로그인 훅 반환 타입
 */
export interface SocialLoginHookReturn {
  handleNewUser: (response: any, userType: UserType) => SocialLoginResponse;
  handleExistingUser: (response: any, userType: UserType) => SocialLoginResponse;
}

/**
 * 프로필 완성 상태 타입
 */
export interface ProfileCompletionStatus {
  profileCompleted: boolean;
  missingFields?: string[];
  completionPercentage?: number;
}

/**
 * 인증 토큰 정보 타입
 */
export interface AuthTokenInfo {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

/**
 * 사용자 세션 정보 타입
 */
export interface UserSession {
  userId: string;
  userType: UserType;
  email?: string;
  phoneNumber?: string;
  profileCompleted: boolean;
  lastLogin: string;
  sessionExpiry: string;
}

/**
 * 비밀번호 변경 요청 타입
 */
export interface PasswordChangeData {
  currentPassword?: string;
  newPassword: string;
  confirmPassword?: string;
}

/**
 * 인증 에러 타입
 */
export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

/**
 * 로그인 상태 확인 결과 타입
 */
export interface AuthCheckResult {
  isAuthenticated: boolean;
  userType: UserType | null;
  needsProfileSetup: boolean;
  sessionValid: boolean;
}