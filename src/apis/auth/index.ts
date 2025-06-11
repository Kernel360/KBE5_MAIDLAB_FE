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
      console.log('🔐 로그인 시도:', {
        userType: data.userType,
        phoneNumber:
          data.phoneNumber.slice(0, 3) + '****' + data.phoneNumber.slice(-4),
      });

      const response = await apiClient.post<ApiResponse<LoginResponseDto>>(
        '/api/auth/login',
        data,
      );

      console.log('✅ 로그인 성공');
      return response.data.data;
    } catch (error: any) {
      console.error('❌ 로그인 실패:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // 일반 회원가입
  signUp: async (data: SignUpRequestDto): Promise<void> => {
    try {
      console.log('📝 회원가입 시도:', {
        userType: data.userType,
        phoneNumber:
          data.phoneNumber.slice(0, 3) + '****' + data.phoneNumber.slice(-4),
        name: data.name,
        birth: data.birth,
        gender: data.gender,
      });

      const response = await apiClient.post<ApiResponse<void>>(
        '/api/auth/sign-up',
        data,
      );
      console.log('✅ 회원가입 성공');
    } catch (error: any) {
      console.error('❌ 회원가입 실패:', error);
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
      console.log('🔗 소셜 로그인 시도:', {
        userType: data.userType,
        socialType: data.socialType,
        codeLength: data.code?.length,
        codePreview: data.code?.substring(0, 20) + '...',
      });

      const response = await apiClient.post<
        ApiResponse<SocialLoginResponseDto>
      >('/api/auth/social-login', data);

      // 🔍 응답 구조 자세히 로깅
      console.log('✅ 소셜 로그인 API 원본 응답:', response.data);
      console.log('📊 응답 데이터 상세:', {
        newUser: response.data.data.newUser,
        hasToken: !!response.data.data.accessToken,
        tokenPreview: response.data.data.accessToken?.substring(0, 20) + '...',
        expirationTime: response.data.data.expirationTime,
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
      console.log('📝 소셜 회원가입 시도:', data);

      await apiClient.post<ApiResponse<void>>('/api/auth/social-sign-up', data);
      console.log('✅ 소셜 회원가입 성공');
    } catch (error: any) {
      console.error('❌ 소셜 회원가입 실패:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // 토큰 갱신
  refreshToken: async (): Promise<LoginResponseDto> => {
    try {
      console.log('🔄 토큰 갱신 시도');

      const response =
        await apiClient.post<ApiResponse<LoginResponseDto>>(
          '/api/auth/refresh',
        );

      console.log('✅ 토큰 갱신 성공');
      return response.data.data;
    } catch (error: any) {
      console.error('❌ 토큰 갱신 실패:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // 로그아웃
  logout: async (): Promise<void> => {
    try {
      console.log('👋 로그아웃 시도');

      await apiClient.post<ApiResponse<void>>('/api/auth/logout');
      console.log('✅ 로그아웃 성공');
    } catch (error: any) {
      console.error('❌ 로그아웃 실패:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // 비밀번호 변경
  changePassword: async (data: ChangePwRequestDto): Promise<void> => {
    try {
      console.log('🔑 비밀번호 변경 시도');

      await apiClient.patch<ApiResponse<void>>(
        '/api/auth/change-password',
        data,
      );

      console.log('✅ 비밀번호 변경 성공');
    } catch (error: any) {
      console.error('❌ 비밀번호 변경 실패:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // 회원 탈퇴
  withdraw: async (): Promise<void> => {
    try {
      console.log('🗑️ 회원 탈퇴 시도');

      await apiClient.delete<ApiResponse<void>>('/api/auth/withdraw');
      console.log('✅ 회원 탈퇴 성공');
    } catch (error: any) {
      console.error('❌ 회원 탈퇴 실패:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },
};
