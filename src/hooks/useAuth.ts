import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/apis/auth';
import {
  isAuthenticated as checkAuth,
  getUserType as getStoredUserType,
  isConsumer,
  isManager,
  canAccessPage,
  login as authLogin,
  logout as authLogout,
} from '@/utils/auth';
import { ROUTES, SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/constants';
import { useToast } from './useToast';
import type {
  LoginRequest,
  SignUpRequest,
  SocialLoginRequest,
  SocialSignUpRequest,
} from '@/types/auth';
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
  login: (data: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  socialLogin: (data: SocialLoginRequest) => Promise<{
    success: boolean;
    newUser?: boolean;
    error?: string;
    accessToken?: string;
    profileCompleted?: boolean;
  }>;
  signUp: (
    data: SignUpRequest,
  ) => Promise<{ success: boolean; error?: string }>;
  socialSignUp: (
    data: SocialSignUpRequest,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetError: () => void;
  changePassword: (
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  withdraw: () => Promise<{ success: boolean; error?: string }>;
  canAccessPage: (requiredUserType?: string) => boolean;
  isConsumer: () => boolean;
  isManager: () => boolean;
}

// 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🔧 소셜 로그인 로직 분리
const useSocialLogin = (showToast: (message: string, type: string) => void) => {
  const handleNewUser = useCallback((response: any, userType: UserType) => {
    // 임시 토큰 저장 (소셜 회원가입용)
    localStorage.setItem('tempSocialToken', response.accessToken);
    localStorage.setItem('tempUserType', userType);

    return {
      success: true,
      newUser: true,
      profileCompleted: response.profileCompleted,
      accessToken: response.accessToken,
    };
  }, []);

  const handleExistingUser = useCallback(
    (response: any, userType: UserType) => {
      // 🔧 utils/auth.ts의 login 함수 활용
      authLogin(response.accessToken, userType);
      showToast(SUCCESS_MESSAGES.LOGIN, 'success');

      // 프로필 완성도에 따른 추가 안내
      if (!response.profileCompleted) {
        setTimeout(() => {
          showToast('프로필을 완성해주세요.', 'info');
        }, 1000);
      }

      return {
        success: true,
        newUser: false,
        profileCompleted: response.profileCompleted,
        accessToken: response.accessToken,
      };
    },
    [showToast],
  );

  return { handleNewUser, handleExistingUser };
};

// Provider 컴포넌트
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const showToastForSocialLogin = (message: string, type: string) => {
    showToast(message, type as any);
  };
  const { handleNewUser, handleExistingUser } = useSocialLogin(
    showToastForSocialLogin,
  );

  // 🔧 초기 인증 상태 확인 - utils/auth.ts 활용
  useEffect(() => {
    const isAuth = checkAuth();
    const userType = getStoredUserType() as UserType;

    if (isAuth && userType) {
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { userType },
      });
    } else {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }, []);

  // 프로필 설정 페이지 이동 로직
  const navigateToProfileSetup = useCallback(
    (userType: UserType, profileCompleted: boolean) => {
      if (!profileCompleted) {
        showToast('프로필을 설정해주세요.', 'info');
        const profileRoute =
          userType === 'MANAGER'
            ? '/manager/profile/setup'
            : '/consumer/profile/setup';
        navigate(profileRoute);
      } else {
        navigate(ROUTES.HOME);
      }
    },
    [navigate, showToast],
  );

  // 로그인 함수
  const login = useCallback(
    async (data: LoginRequest) => {
      try {
        dispatch({ type: 'AUTH_START' });

        const response = await authApi.login(data);

        authLogin(response.accessToken, data.userType);

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { userType: data.userType as UserType },
        });

        showToast(SUCCESS_MESSAGES.LOGIN, 'success');
        navigateToProfileSetup(
          data.userType as UserType,
          response.profileCompleted || false,
        );

        return { success: true };
      } catch (error: any) {
        const errorMessage =
          error.message || ERROR_MESSAGES.INVALID_CREDENTIALS;
        dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
        showToast(errorMessage, 'error');
        return { success: false, error: errorMessage };
      }
    },
    [showToast, navigateToProfileSetup],
  );

  // 소셜 로그인 함수
  const socialLogin = useCallback(
    async (data: SocialLoginRequest) => {
      try {
        dispatch({ type: 'AUTH_START' });
        const response = await authApi.socialLogin(data);

        if (response.newUser) {
          dispatch({ type: 'AUTH_LOGOUT' });
          return handleNewUser(response, data.userType as UserType);
        } else {
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { userType: data.userType as UserType },
          });
          return handleExistingUser(response, data.userType as UserType);
        }
      } catch (error: any) {
        const errorMessage =
          error.message || ERROR_MESSAGES.INVALID_CREDENTIALS;
        dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
        showToast(errorMessage, 'error');
        return { success: false, error: errorMessage };
      }
    },
    [handleNewUser, handleExistingUser, showToast],
  );

  // 회원가입 함수
  const signUp = useCallback(
    async (data: SignUpRequest) => {
      try {
        dispatch({ type: 'AUTH_START' });

        await authApi.signUp(data);

        // 자동 로그인
        const loginResponse = await authApi.login({
          userType: data.userType,
          phoneNumber: data.phoneNumber,
          password: data.password,
        });

        authLogin(loginResponse.accessToken, data.userType);

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
    async (data: SocialSignUpRequest) => {
      try {
        dispatch({ type: 'AUTH_START' });

        const tempToken = localStorage.getItem('tempSocialToken');
        if (!tempToken) {
          throw new Error('인증 정보가 없습니다.');
        }

        await authApi.socialSignUp(data, tempToken);

        localStorage.removeItem('tempSocialToken');
        localStorage.removeItem('tempUserType');

        dispatch({ type: 'AUTH_LOGOUT' });
        showToast(SUCCESS_MESSAGES.SIGNUP, 'success');

        return { success: true };
      } catch (error: any) {
        localStorage.removeItem('tempSocialToken');
        localStorage.removeItem('tempUserType');

        const errorMessage = error.message || ERROR_MESSAGES.UNKNOWN;
        dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
        showToast(errorMessage, 'error');
        return { success: false, error: errorMessage };
      }
    },
    [showToast],
  );

  // 로그아웃 함수
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
      authLogout();
      dispatch({ type: 'AUTH_LOGOUT' });
      showToast(SUCCESS_MESSAGES.LOGOUT, 'success');
      navigate(ROUTES.HOME);
    } catch (error: any) {
      const errorMessage = error?.message || '로그아웃 중 오류가 발생했습니다.';
      showToast(errorMessage, 'error');
    }
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
      authLogout();
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
    canAccessPage,
    isConsumer,
    isManager,
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
