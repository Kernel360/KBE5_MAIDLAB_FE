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
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // 일반 회원가입
  signUp: async (data: SignUpRequestDto): Promise<void> => {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        '/api/auth/sign-up',
        data,
      );
    } catch (error: any) {
      const errorMessage = handleApiError(error);

      // 특별히 중복 전화번호 에러인 경우 더 명확한 메시지
      if (errorMessage.includes('Duplicate') || errorMessage.includes('중복')) {
        throw new Error('이미 가입되어있는 휴대폰번호입니다.');
      }

      throw new Error(errorMessage);
    }
  },

  // 소셜 로그인
  socialLogin: async (
    data: SocialLoginRequestDto,
  ): Promise<SocialLoginResponseDto> => {
    try {
      const response = await apiClient.post<
        ApiResponse<SocialLoginResponseDto>
      >('/api/auth/social-login', data);

      return response.data.data;
    } catch (error: any) {
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
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
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
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // 로그아웃
  logout: async (): Promise<void> => {
    try {
      await apiClient.post<ApiResponse<void>>('/api/auth/logout');
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // 비밀번호 변경
  changePassword: async (data: ChangePwRequestDto): Promise<void> => {
    try {
      await apiClient.patch<ApiResponse<void>>(
        '/api/auth/change-password',
        data,
      );
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // 회원 탈퇴
  withdraw: async (): Promise<void> => {
    try {
      await apiClient.delete<ApiResponse<void>>('/api/auth/withdraw');
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },
};
