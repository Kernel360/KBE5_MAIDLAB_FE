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
import {
  ROUTES,
  USER_TYPES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from '@/constants';
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
  socialLogin: (
    data: SocialLoginRequestDto,
  ) => Promise<{ success: boolean; needsSignup?: boolean; error?: string }>;
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

        navigate(ROUTES.HOME);

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
          dispatch({ type: 'AUTH_LOGOUT' });
          return { success: true, needsSignup: true };
        }

        tokenStorage.setAccessToken(response.accessToken);
        userStorage.setUserType(data.userType);

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { userType: data.userType as UserType },
        });

        showToast(SUCCESS_MESSAGES.LOGIN, 'success');
        return { success: true, needsSignup: false };
      } catch (error: any) {
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

        await authApi.signUp(data);

        showToast(SUCCESS_MESSAGES.SIGNUP, 'success');
        dispatch({ type: 'AUTH_LOGOUT' });

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

        await authApi.socialSignUp(data);

        showToast(SUCCESS_MESSAGES.SIGNUP, 'success');
        dispatch({ type: 'AUTH_LOGOUT' });

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
