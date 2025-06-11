import { apiClient, type ApiResponse, handleApiError } from '../index';

// 인증 관련 타입 정의
export interface LoginRequestDto {
  userType: 'CONSUMER' | 'MANAGER';
  phoneNumber: string;
  password: string;
}

export interface SignUpRequestDto {
  userType: 'CONSUMER' | 'MANAGER';
  phoneNumber: string;
  password: string;
  name: string;
  birth: string;
  gender: 'MALE' | 'FEMALE';
}

export interface SocialLoginRequestDto {
  userType: 'CONSUMER' | 'MANAGER';
  socialType: 'KAKAO' | 'GOOGLE';
  code: string;
}

export interface SocialSignUpRequestDto {
  birth: string;
  gender: 'MALE' | 'FEMALE';
}

export interface ChangePwRequestDto {
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  expirationTime: number;
}

export interface SocialLoginResponseDto {
  newUser: boolean;
  accessToken: string;
  expirationTime: number;
}

// 인증 API 함수들
export const authApi = {
  // 일반 로그인
  login: async (data: LoginRequestDto): Promise<LoginResponseDto> => {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponseDto>>(
        '/api/auth/login',
        data,
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 일반 회원가입
  signUp: async (data: SignUpRequestDto): Promise<void> => {
    try {
      await apiClient.post<ApiResponse<void>>('/api/auth/sign-up', data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 소셜 로그인
  socialLogin: async (
    data: SocialLoginRequestDto,
  ): Promise<SocialLoginResponseDto> => {
    try {
      console.log('🔗 소셜 로그인 시도:', {
        userType: data.userType,
        socialType: data.socialType,
        codeLength: data.code?.length,
        codePreview: data.code?.substring(0, 20) + '...',
      });

      const response = await apiClient.post<
        ApiResponse<SocialLoginResponseDto>
      >('/api/auth/social-login', data);

      console.log('✅ 소셜 로그인 성공:', {
        newUser: response.data.data.newUser,
        hasToken: !!response.data.data.accessToken,
      });
      return response.data.data;
    } catch (error: any) {
      console.error('❌ 소셜 로그인 실패:', error);

      // 에러 상세 정보 로깅
      if (error.response) {
        console.error('📊 에러 응답:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });
      }

      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // 소셜 회원가입
  socialSignUp: async (data: SocialSignUpRequestDto): Promise<void> => {
    try {
      await apiClient.post<ApiResponse<void>>('/api/auth/social-sign-up', data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 토큰 갱신
  refreshToken: async (): Promise<LoginResponseDto> => {
    try {
      const response =
        await apiClient.post<ApiResponse<LoginResponseDto>>(
          '/api/auth/refresh',
        );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 로그아웃
  logout: async (): Promise<void> => {
    try {
      await apiClient.post<ApiResponse<void>>('/api/auth/logout');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 비밀번호 변경
  changePassword: async (data: ChangePwRequestDto): Promise<void> => {
    try {
      await apiClient.patch<ApiResponse<void>>(
        '/api/auth/change-password',
        data,
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 회원 탈퇴
  withdraw: async (): Promise<void> => {
    try {
      await apiClient.delete<ApiResponse<void>>('/api/auth/withdraw');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
