import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth, useForm, useToast } from '@/hooks';
import { ROUTES } from '@/constants';
import { validateBirthDate } from '@/constants/validation';
import type { SignUpRequest } from '@/types/domain/auth';
import { Header } from '@/components/layout/Header/Header';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, isLoading } = useAuth();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<
    'CONSUMER' | 'MANAGER'
  >('CONSUMER');

  const navigateToProfileSetup = (userType: 'CONSUMER' | 'MANAGER') => {
    const route =
      userType === 'MANAGER'
        ? ROUTES.MANAGER.PROFILE_SETUP
        : ROUTES.CONSUMER.PROFILE_SETUP;

    navigate(route, {
      replace: true,
      state: { fromSignup: true },
    });
  };

  const { values, errors, touched, handleSubmit, setValue, setFieldTouched } =
    useForm<
      SignUpRequest & {
        confirmPassword: string;
      }
    >({
      initialValues: {
        userType: 'CONSUMER',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        name: '',
        birth: '',
        gender: 'MALE',
      },

      validationSchema: {
        phoneNumber: (value) => /^01[0-9]{8,9}$/.test(value.replace(/-/g, '')),
        password: (value) =>
          /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,20}$/.test(value),
        name: (value) => value.length >= 2 && value.length <= 20,
        birth: (value) => validateBirthDate(value).isValid,
      },

      onSubmit: async (formData) => {
        if (formData.password !== formData.confirmPassword) {
          showToast('비밀번호가 일치하지 않습니다.', 'error');
          return;
        }

        const cleanedData: SignUpRequest = {
          userType: selectedUserType,
          phoneNumber: formData.phoneNumber.replace(/-/g, ''),
          password: formData.password,
          name: formData.name,
          birth: formData.birth,
          gender: formData.gender,
        };

        const result = await signUp(cleanedData);

        if (result.success) {
          if (selectedUserType === 'MANAGER') {
            showToast(
              '매니저 서비스 제공을 위해 프로필을 완성해주세요.',
              'info',
            );
          } else {
            showToast('더 나은 서비스를 위해 프로필을 설정해보세요.', 'info');
          }

          navigateToProfileSetup(selectedUserType);
        } else {
          console.error('회원가입 실패:', result);
          showToast(result.error || '회원가입에 실패했습니다.', 'error');
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

  const handleBirthChange = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    let formatted = numbers;

    if (numbers.length > 4 && numbers.length <= 6) {
      formatted = `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
    } else if (numbers.length > 6) {
      formatted = `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(6, 8)}`;
    }

    setValue('birth', formatted);
  };

  const getBirthErrorMessage = () => {
    if (!errors.birth || !touched.birth) return '';
    const validation = validateBirthDate(values.birth);
    return validation.error || '올바른 생년월일을 입력해주세요.';
  };

  const getPasswordStrength = () => {
    const password = values.password;
    if (!password) return { strength: 0, text: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;

    if (strength <= 2) return { strength, text: '약함', color: 'text-red-500' };
    if (strength <= 3)
      return { strength, text: '보통', color: 'text-yellow-500' };
    return { strength, text: '강함', color: 'text-green-500' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <Header
        variant="sub"
        title="회원가입"
        backRoute={ROUTES.LOGIN}
        showMenu={false}
      />

      <main className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 사용자 타입 선택 */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setSelectedUserType('CONSUMER')}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                  selectedUserType === 'CONSUMER'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                회원
              </button>
              <button
                type="button"
                onClick={() => setSelectedUserType('MANAGER')}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                  selectedUserType === 'MANAGER'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                매니저
              </button>
            </div>

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
              {values.password && (
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        passwordStrength.strength <= 2
                          ? 'bg-red-500'
                          : passwordStrength.strength <= 3
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                      style={{
                        width: `${(passwordStrength.strength / 5) * 100}%`,
                      }}
                    />
                  </div>
                  <span className={`text-xs ${passwordStrength.color}`}>
                    {passwordStrength.text}
                  </span>
                </div>
              )}
              {errors.password && touched.password && (
                <p className="text-red-500 text-sm">
                  영문과 숫자를 포함하여 8-20자로 입력해주세요.
                </p>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                비밀번호 확인
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={values.confirmPassword}
                onChange={(e) => setValue('confirmPassword', e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  values.confirmPassword &&
                  values.password !== values.confirmPassword
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {values.confirmPassword &&
                values.password !== values.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    비밀번호가 일치하지 않습니다.
                  </p>
                )}
            </div>

            {/* 이름 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                이름
              </label>
              <input
                type="text"
                value={values.name}
                onChange={(e) => setValue('name', e.target.value)}
                onBlur={() => setFieldTouched('name')}
                placeholder="홍길동"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  errors.name && touched.name
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {errors.name && touched.name && (
                <p className="text-red-500 text-sm">
                  이름은 2-20자로 입력해주세요.
                </p>
              )}
            </div>

            {/* 성별 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                성별
              </label>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setValue('gender', 'MALE')}
                  className={`flex-1 py-3 px-4 rounded-lg border transition-all ${
                    values.gender === 'MALE'
                      ? 'border-orange-500 bg-orange-50 text-orange-600 font-medium'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  남성
                </button>
                <button
                  type="button"
                  onClick={() => setValue('gender', 'FEMALE')}
                  className={`flex-1 py-3 px-4 rounded-lg border transition-all ${
                    values.gender === 'FEMALE'
                      ? 'border-orange-500 bg-orange-50 text-orange-600 font-medium'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  여성
                </button>
              </div>
            </div>

            {/* 생년월일 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                생년월일
              </label>
              <input
                type="text"
                value={values.birth}
                onChange={(e) => handleBirthChange(e.target.value)}
                onBlur={() => setFieldTouched('birth')}
                placeholder="1990-01-01"
                maxLength={10}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  errors.birth && touched.birth
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {errors.birth && touched.birth && (
                <p className="text-red-500 text-sm">{getBirthErrorMessage()}</p>
              )}
            </div>

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-lg transition-colors relative"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  프로필 설정 페이지로 이동 중...
                </div>
              ) : (
                '회원가입'
              )}
            </button>

            {/* 로그인 링크 */}
            <div className="text-center">
              <span className="text-gray-600 text-sm">
                이미 계정이 있으신가요?{' '}
              </span>
              <Link
                to={ROUTES.LOGIN}
                className="text-orange-500 text-sm font-medium hover:underline"
              >
                로그인
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SignUp;
