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

// 🆕 전역 로그아웃 핸들러 타입 정의
type GlobalLogoutHandler = (() => void) | null;

// 🆕 전역 로그아웃 핸들러 관리
let globalLogoutHandler: GlobalLogoutHandler = null;

export const setGlobalLogoutHandler = (handler: GlobalLogoutHandler) => {
  globalLogoutHandler = handler;
};

export const getGlobalLogoutHandler = (): GlobalLogoutHandler => {
  return globalLogoutHandler;
};

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
  userInfo:
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('userInfo') || 'null')
      : null,
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

  // 전역 로그아웃 핸들러 등록
  useEffect(() => {
    const globalLogout = () => {
      console.log('🚨 전역 로그아웃 핸들러 실행됨');

      try {
        // 1. 로컬 상태 정리
        authLogout();
        dispatch({ type: 'AUTH_LOGOUT' });

        // 2. 즉시 홈으로 이동 (window.location 사용으로 안정성 확보)
        console.log('🔄 홈으로 리다이렉트 중...');
        window.location.replace('/');
      } catch (error) {
        console.error('🚨 전역 로그아웃 핸들러 실행 중 오류:', error);
        // 오류 발생 시 강제 리다이렉트
        window.location.replace('/');
      }
    };

    console.log('📝 전역 로그아웃 핸들러 등록됨');
    setGlobalLogoutHandler(globalLogout);

    // cleanup 함수
    return () => {
      console.log('🗑️ 전역 로그아웃 핸들러 해제됨');
      setGlobalLogoutHandler(null);
    };
  }, []); // ✅ 빈 의존성 배열 - 마운트 시 한 번만 실행

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

        // userInfo에 서버 응답 전체 저장 및 localStorage에도 저장
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { userType: data.userType as UserType, userInfo: response },
        });
        localStorage.setItem('userInfo', JSON.stringify(response));

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
            payload: {
              userType: data.userType as UserType,
              userInfo: response,
            },
          });
          localStorage.setItem('userInfo', JSON.stringify(response));
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

  // 🆕 로그아웃 함수 - API 호출 실패해도 로컬 로그아웃 진행
  const logout = useCallback(async () => {
    try {
      // API 호출 시도
      await authApi.logout();
    } catch (error: any) {
      // API 호출 실패해도 로컬 로그아웃은 진행
      console.warn(
        '로그아웃 API 호출 실패, 로컬 로그아웃 진행:',
        error.message,
      );
    } finally {
      // 항상 로컬 로그아웃 처리
      authLogout();
      localStorage.removeItem('userInfo');
      dispatch({ type: 'AUTH_LOGOUT' });
      showToast(SUCCESS_MESSAGES.LOGOUT, 'success');
      navigate(ROUTES.HOME);
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
