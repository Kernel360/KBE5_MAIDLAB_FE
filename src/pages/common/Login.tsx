import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth, useForm, useToast } from '@/hooks';
import { ROUTES, STORAGE_KEYS } from '@/constants';
import {
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
} from '@/utils/storage';
import { openGoogleLoginPopup, cleanupOAuthStorage } from '@/utils/googleOAuth';
import type { LoginRequest, SocialLoginRequest } from '@/types/domain/auth';
import type { SavedLoginInfo } from '@/types/domain/user';
import { LOGIN_USER_TYPES, type LoginUserType } from '@/constants/user';
import { Header } from '@/components/layout/Header/Header';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, socialLogin, isLoading } = useAuth();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<LoginUserType>(
    LOGIN_USER_TYPES.CONSUMER,
  );

  useEffect(() => {
    cleanupOAuthStorage();

    const savedLoginInfo = getLocalStorage<SavedLoginInfo>(
      STORAGE_KEYS.SAVED_LOGIN_INFO,
    );

    if (
      savedLoginInfo &&
      savedLoginInfo.rememberMe &&
      savedLoginInfo.userType in LOGIN_USER_TYPES
    ) {
      setValue('phoneNumber', savedLoginInfo.phoneNumber || '');
      setValue('rememberMe', true);
      setSelectedUserType(savedLoginInfo.userType as LoginUserType);
    }
  }, []);

  const { values, errors, touched, handleSubmit, setValue, setFieldTouched } =
    useForm<LoginRequest & { rememberMe: boolean }>({
      initialValues: {
        userType: 'CONSUMER',
        phoneNumber: '',
        password: '',
        rememberMe: false,
      },

      validationSchema: {
        phoneNumber: (value) => /^01[0-9]{8,9}$/.test(value.replace(/-/g, '')),
        password: (value) => value.length >= 8,
      },

      onSubmit: async (formData) => {
        const cleanedData: LoginRequest = {
          userType: selectedUserType,
          phoneNumber: formData.phoneNumber.replace(/-/g, ''),
          password: formData.password,
        };

        if (formData.rememberMe) {
          const loginInfo: SavedLoginInfo = {
            phoneNumber: formData.phoneNumber,
            userType: selectedUserType,
            rememberMe: true,
          };

          setLocalStorage(
            STORAGE_KEYS.SAVED_LOGIN_INFO,
            loginInfo,
            30 * 24 * 60 * 60 * 1000,
          );
        } else {
          removeLocalStorage(STORAGE_KEYS.SAVED_LOGIN_INFO);
        }

        const result = await login(cleanedData);

        // ✅ 로그인 성공 시 무조건 홈으로 이동 (프로필 체크 로직 제거)
        if (result?.success) {
          navigate(ROUTES.HOME, { replace: true });
        }
      },
    });

  const handlePhoneChange = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    let formatted = numbers;

    if (numbers.length > 3 && numbers.length <= 7) {
      formatted = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length > 7) {
      formatted = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }

    setValue('phoneNumber', formatted);
  };

  const handleGoogleLogin = () => {
    openGoogleLoginPopup(
      selectedUserType,
      async (code: string, userType: 'CONSUMER' | 'MANAGER') => {
        try {
          const socialLoginData: SocialLoginRequest = {
            userType,
            socialType: 'GOOGLE',
            code,
          };

          const result = await socialLogin(socialLoginData);

          if (result.success) {
            if (result.newUser) {
              // 신규 사용자는 소셜 회원가입 페이지로
              showToast('추가 정보를 입력해주세요.', 'info');
              navigate(ROUTES.SOCIAL_SIGNUP, { replace: true });
            } else {
              // ✅ 기존 사용자는 무조건 홈으로 (프로필 체크 로직 제거)
              // 각 페이지의 ProtectedRoute에서 프로필 유무에 따라 리다이렉트 처리
              navigate(ROUTES.HOME, { replace: true });
            }
          } else {
            showToast(result.error || 'Google 로그인에 실패했습니다.', 'error');
          }
        } catch (error: any) {
          showToast('Google 로그인 중 오류가 발생했습니다.', 'error');
        }
      },
      (error: string) => {
        showToast(error, 'error');
      },
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <Header
        variant="sub"
        title="로그인"
        backRoute={ROUTES.HOME}
        showMenu={false}
      />

      <main className="px-4 py-6">
        <div className="max-w-md mx-auto">
          {/* 사용자 타입 선택 */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setSelectedUserType(LOGIN_USER_TYPES.CONSUMER)}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedUserType === LOGIN_USER_TYPES.CONSUMER
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              회원
            </button>
            <button
              type="button"
              onClick={() => setSelectedUserType(LOGIN_USER_TYPES.MANAGER)}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedUserType === LOGIN_USER_TYPES.MANAGER
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              매니저
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 휴대폰 번호 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                휴대폰 번호
              </label>
              <input
                type="tel"
                value={values.phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onBlur={() => setFieldTouched('phoneNumber')}
                placeholder="010-0000-0000"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  errors.phoneNumber && touched.phoneNumber
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {errors.phoneNumber && touched.phoneNumber && (
                <p className="text-red-500 text-sm">
                  올바른 휴대폰 번호를 입력해주세요.
                </p>
              )}
            </div>

            {/* 비밀번호 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={values.password}
                  onChange={(e) => setValue('password', e.target.value)}
                  onBlur={() => setFieldTouched('password')}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    errors.password && touched.password
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="text-red-500 text-sm">
                  비밀번호를 8자 이상 입력해주세요.
                </p>
              )}
            </div>

            {/* 로그인 정보 기억하기 */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={values.rememberMe}
                onChange={(e) => setValue('rememberMe', e.target.checked)}
                className="checkbox-orange"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 text-sm text-gray-600"
              >
                로그인 정보 기억하기
              </label>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-lg transition-colors relative"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  로그인 중...
                </div>
              ) : (
                '로그인'
              )}
            </button>

            {/* 구분선 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">또는</span>
              </div>
            </div>

            {/* 소셜 로그인 버튼들 */}
            <div className="space-y-3">
              {/* Google 로그인 */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google로 로그인
              </button>
            </div>

            {/* 회원가입 링크 */}
            <div className="text-center">
              <span className="text-gray-600 text-sm">
                아직 계정이 없으신가요?{' '}
              </span>
              <Link
                to={ROUTES.SIGNUP}
                className="text-orange-500 text-sm font-medium hover:underline"
              >
                회원가입
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;
