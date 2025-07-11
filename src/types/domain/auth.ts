import type { UserType, Gender, SocialType } from '@/constants/user';

/**
 * 로그인 요청
 */
export interface LoginRequest {
  userType: UserType;
  phoneNumber: string;
  password: string;
}

/**
 * 회원가입 요청
 */
export interface SignUpRequest {
  userType: UserType;
  phoneNumber: string;
  password: string;
  name: string;
  birth: string;
  gender: Gender;
}

/**
 * 소셜 로그인 요청
 */
export interface SocialLoginRequest {
  userType: UserType;
  socialType: SocialType;
  code: string;
}

/**
 * 소셜 회원가입 요청
 */
export interface SocialSignUpRequest {
  birth: string;
  gender: Gender;
}

/**
 * 비밀번호 변경 요청
 */
export interface PasswordChangeRequest {
  password: string;
}

/**
 * 로그인 응답
 */
export interface LoginResponse {
  accessToken: string;
  expirationTime: number;
  profileCompleted?: boolean;
}

/**
 * 소셜 로그인 응답
 */
export interface SocialLoginResponse {
  newUser: boolean;
  profileCompleted: boolean;
  accessToken: string;
  expirationTime: number;
}

/**
 * 토큰 정보
 */
export interface TokenInfo {
  accessToken: string;
  refreshToken?: string;
  expirationTime: number;
}

/**
 * 인증 상태
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: number;
    userType: UserType;
    name: string;
    profileImage?: string;
  } | null;
  token: string | null;
  isLoading: boolean;
}

/**
 * 로그인 폼 데이터
 */
export interface LoginFormData {
  userType: UserType;
  phoneNumber: string;
  password: string;
  rememberMe: boolean;
}

/**
 * 회원가입 폼 데이터
 */
export interface SignUpFormData {
  userType: UserType;
  phoneNumber: string;
  password: string;
  passwordConfirm: string;
  name: string;
  birth: string;
  gender: Gender;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
}

/**
 * 소셜 회원가입 폼 데이터
 */
export interface SocialSignUpFormData {
  birth: string;
  gender: Gender;
}

/**
 * 비밀번호 변경 폼 데이터
 */
export interface PasswordChangeFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * 인증 에러
 */
export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

/**
 * OAuth 상태
 */
export interface OAuthState {
  userType: UserType;
  socialType: SocialType;
  redirectUrl?: string;
}

/**
 * 사용자 정보
 */
export interface UserInfo {
  id: string;
  name: string;
  email: string;
  permissions?: string[];
  [key: string]: unknown;
}

/**
 * JWT 페이로드
 */
export interface JWTPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  userId?: string;
  userType?: string;
  permissions?: string[];
  [key: string]: unknown;
}

/**
 * 세션 정보
 */
export interface SessionInfo {
  userId: number;
  userType: UserType;
  issuedAt: number;
  expiresAt: number;
  lastActivity: number;
}

/**
 * 팝업 설정
 */
export interface PopupConfig {
  width: number;
  height: number;
  timeout: number;
  fastPollInterval: number;
  slowPollInterval: number;
  fastPollDuration: number;
}
