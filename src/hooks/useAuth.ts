import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/apis/auth';
import { tokenStorage, userStorage } from '@/utils/storage';
import { ROUTES, SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/constants';
import { useToast } from './useToast';
import type {
  LoginRequestDto,
  SignUpRequestDto,
  SocialLoginRequestDto,
  SocialSignUpRequestDto,
} from '@/apis/auth';
import type { UserType } from '@/types';

// 인증 상태 타입
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userType: UserType | null;
  userInfo: any | null;
  error: string | null;
}

// 인증 액션 타입
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { userType: UserType; userInfo?: any } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_RESET_ERROR' };

// 초기 상태
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  userType: null,
  userInfo: null,
  error: null,
};

// 리듀서
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        userType: action.payload.userType,
        userInfo: action.payload.userInfo,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        userType: null,
        userInfo: null,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return { ...initialState, isLoading: false };
    case 'AUTH_RESET_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// 컨텍스트 타입
interface AuthContextType extends AuthState {
  login: (
    data: LoginRequestDto,
  ) => Promise<{ success: boolean; error?: string }>;
  socialLogin: (data: SocialLoginRequestDto) => Promise<{
    success: boolean;
    newUser?: boolean;
    error?: string;
    accessToken?: string;
    profileCompleted?: boolean;
  }>;
  signUp: (
    data: SignUpRequestDto,
  ) => Promise<{ success: boolean; error?: string }>;
  socialSignUp: (
    data: SocialSignUpRequestDto,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetError: () => void;
  changePassword: (
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  withdraw: () => Promise<{ success: boolean; error?: string }>;
}

// 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider 컴포넌트
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { showToast } = useToast();
  const navigate = useNavigate();

  // 초기 인증 상태 확인
  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    const userType = userStorage.getUserType() as UserType;
    const userInfo = userStorage.getUserInfo();

    if (token && userType) {
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { userType, userInfo },
      });
    } else {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }, []);

  // 로그인 함수
  const login = useCallback(
    async (data: LoginRequestDto) => {
      try {
        dispatch({ type: 'AUTH_START' });

        const response = await authApi.login(data);

        tokenStorage.setAccessToken(response.accessToken);
        userStorage.setUserType(data.userType);

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { userType: data.userType as UserType },
        });

        showToast(SUCCESS_MESSAGES.LOGIN, 'success');

        // 🔧 프로필 완성 여부에 따라 페이지 이동 결정
        if (!response.profileCompleted) {
          // 프로필이 없는 경우 프로필 설정 페이지로
          showToast('프로필을 설정해주세요.', 'info');
          const profileRoute =
            data.userType === 'MANAGER'
              ? '/manager/profile/setup' // 🔧 실제 라우트 경로 사용
              : '/consumer/profile/setup'; // 🔧 소비자도 실제 경로로 수정
          navigate(profileRoute);
        } else {
          // 프로필이 있는 경우 홈으로
          navigate(ROUTES.HOME);
        }

        return { success: true };
      } catch (error: any) {
        const errorMessage =
          error.message || ERROR_MESSAGES.INVALID_CREDENTIALS;
        dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
        showToast(errorMessage, 'error');
        return { success: false, error: errorMessage };
      }
    },
    [showToast, navigate],
  );

  // 소셜 로그인 함수
  const socialLogin = useCallback(
    async (data: SocialLoginRequestDto) => {
      try {
        dispatch({ type: 'AUTH_START' });

        const response = await authApi.socialLogin(data);

        if (response.newUser) {
          localStorage.setItem('tempSocialToken', response.accessToken);
          localStorage.setItem('tempUserType', data.userType);

          dispatch({ type: 'AUTH_LOGOUT' });

          return {
            success: true,
            newUser: true,
            profileCompleted: response.profileCompleted,
            accessToken: response.accessToken,
          };
        }

        // 🔧 기존 사용자는 프로필 완성 여부와 관계없이 정식 로그인 처리
        if (!response.newUser) {
          console.log('🔑 기존 사용자 정식 로그인 처리:', {
            profileCompleted: response.profileCompleted,
          });

          // 정식 토큰으로 로그인 처리
          tokenStorage.setAccessToken(response.accessToken);
          userStorage.setUserType(data.userType);

          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { userType: data.userType as UserType },
          });

          showToast(SUCCESS_MESSAGES.LOGIN, 'success');

          // 🔧 프로필 완성 여부에 따라 추가 안내만 제공
          if (!response.profileCompleted) {
            setTimeout(() => {
              showToast('프로필을 완성해주세요.', 'info');
            }, 1000);
          }
        }

        return {
          success: true,
          newUser: response.newUser,
          profileCompleted: response.profileCompleted,
          accessToken: response.accessToken,
        };
      } catch (error: any) {
        console.error('❌ useAuth socialLogin 에러:', error);
        const errorMessage =
          error.message || ERROR_MESSAGES.INVALID_CREDENTIALS;
        dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
        showToast(errorMessage, 'error');
        return { success: false, error: errorMessage };
      }
    },
    [showToast],
  );

  // 회원가입 함수
  const signUp = useCallback(
    async (data: SignUpRequestDto) => {
      try {
        dispatch({ type: 'AUTH_START' });

        // 회원가입
        await authApi.signUp(data);

        // 자동 로그인
        const loginData = {
          userType: data.userType,
          phoneNumber: data.phoneNumber,
          password: data.password,
        };
        const loginResponse = await authApi.login(loginData);

        // 로그인 상태로 변경
        tokenStorage.setAccessToken(loginResponse.accessToken);
        userStorage.setUserType(data.userType);

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { userType: data.userType as UserType },
        });

        showToast(SUCCESS_MESSAGES.SIGNUP, 'success');

        return { success: true };
      } catch (error: any) {
        const errorMessage = error.message || ERROR_MESSAGES.UNKNOWN;
        dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
        showToast(errorMessage, 'error');
        return { success: false, error: errorMessage };
      }
    },
    [showToast],
  );

  // 소셜 회원가입 함수
  const socialSignUp = useCallback(
    async (data: SocialSignUpRequestDto) => {
      try {
        dispatch({ type: 'AUTH_START' });

        // 임시 토큰을 localStorage에서 가져오기
        const tempToken = localStorage.getItem('tempSocialToken');
        const userType = localStorage.getItem('tempUserType') as UserType;

        if (!tempToken) {
          throw new Error('인증 정보가 없습니다.');
        }

        await authApi.socialSignUp(data, tempToken);

        // 🔧 회원가입 성공 후 로그아웃 상태로 유지
        // SocialSignUp 페이지에서 토큰 정리와 홈 이동 처리
        dispatch({ type: 'AUTH_LOGOUT' });

        showToast(SUCCESS_MESSAGES.SIGNUP, 'success');

        return { success: true };
      } catch (error: any) {
        console.error('❌ socialSignUp 에러:', {
          message: error.message,
          response: error.response,
        });

        const errorMessage = error.message || ERROR_MESSAGES.UNKNOWN;
        dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
        showToast(errorMessage, 'error');
        return { success: false, error: errorMessage };
      }
    },
    [showToast, navigate],
  );

  // 로그아웃 함수
  const logout = useCallback(() => {
    authApi.logout().catch(() => {
      // API 실패해도 로컬 정리는 진행
    });

    tokenStorage.clearTokens();
    userStorage.clearUserData();

    dispatch({ type: 'AUTH_LOGOUT' });
    showToast(SUCCESS_MESSAGES.LOGOUT, 'success');
    navigate(ROUTES.LOGIN);
  }, [showToast, navigate]);

  // 비밀번호 변경 함수
  const changePassword = useCallback(
    async (password: string) => {
      try {
        await authApi.changePassword({ password });
        showToast(SUCCESS_MESSAGES.PASSWORD_CHANGED, 'success');
        return { success: true };
      } catch (error: any) {
        const errorMessage = error.message || ERROR_MESSAGES.UNKNOWN;
        showToast(errorMessage, 'error');
        return { success: false, error: errorMessage };
      }
    },
    [showToast],
  );

  // 회원탈퇴 함수
  const withdraw = useCallback(async () => {
    try {
      await authApi.withdraw();

      tokenStorage.clearTokens();
      userStorage.clearUserData();

      dispatch({ type: 'AUTH_LOGOUT' });
      showToast(SUCCESS_MESSAGES.ACCOUNT_DELETED, 'success');
      navigate(ROUTES.LOGIN);

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || ERROR_MESSAGES.UNKNOWN;
      showToast(errorMessage, 'error');
      return { success: false, error: errorMessage };
    }
  }, [showToast, navigate]);

  // 에러 초기화
  const resetError = useCallback(() => {
    dispatch({ type: 'AUTH_RESET_ERROR' });
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    socialLogin,
    signUp,
    socialSignUp,
    logout,
    resetError,
    changePassword,
    withdraw,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};

// 훅 함수
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
