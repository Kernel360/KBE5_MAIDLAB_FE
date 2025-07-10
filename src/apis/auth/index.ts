import { apiCall } from '../index';
import type {
  LoginRequest,
  SignUpRequest,
  SocialLoginRequest,
  SocialSignUpRequest,
  PasswordChangeRequest,
  LoginResponse,
  SocialLoginResponse,
} from '@/types/domain/auth';
import { API_ENDPOINTS } from '@/constants/api';

/**
 * 인증 API 함수들
 */
export const authApi = {
  /**
   * 일반 로그인
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return apiCall<LoginResponse>('post', API_ENDPOINTS.AUTH.LOGIN, data);
  },

  /**
   * 일반 회원가입
   */
  signUp: async (data: SignUpRequest): Promise<void> => {
    try {
      return await apiCall<void>('post', API_ENDPOINTS.AUTH.SIGNUP, data);
    } catch (error: any) {
      // 특별히 중복 전화번호 에러인 경우 더 명확한 메시지
      if (
        error.message.includes('Duplicate') ||
        error.message.includes('중복')
      ) {
        throw new Error('이미 가입되어있는 휴대폰번호입니다.');
      }
      throw error;
    }
  },

  /**
   * 소셜 로그인
   */
  socialLogin: async (
    data: SocialLoginRequest,
  ): Promise<SocialLoginResponse> => {
    return apiCall<SocialLoginResponse>(
      'post',
      API_ENDPOINTS.AUTH.SOCIAL_LOGIN,
      data,
    );
  },

  /**
   * 소셜 회원가입
   */
  socialSignUp: async (
    data: SocialSignUpRequest,
    tempToken: string,
  ): Promise<void> => {
    return apiCall<void>('post', API_ENDPOINTS.AUTH.SOCIAL_SIGNUP, data, {
      headers: {
        Authorization: `Bearer ${tempToken}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 로그아웃
   */
  logout: async (): Promise<void> => {
    return apiCall<void>('post', API_ENDPOINTS.AUTH.LOGOUT);
  },

  /**
   * 비밀번호 변경
   */
  changePassword: async (data: PasswordChangeRequest): Promise<void> => {
    return apiCall<void>('patch', API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },

  /**
   * 토큰 갱신
   */
  refreshToken: async (): Promise<LoginResponse> => {
    return apiCall<LoginResponse>('post', API_ENDPOINTS.AUTH.REFRESH);
  },

  /**
   * 회원 탈퇴
   */
  withdraw: async (): Promise<void> => {
    return apiCall<void>('delete', API_ENDPOINTS.AUTH.WITHDRAW);
  },
};
