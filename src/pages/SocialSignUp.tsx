import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth, useForm, useToast } from '@/hooks';
import { ROUTES } from '@/constants';
import type { SocialSignUpRequestDto } from '@/apis/auth';

const SocialSignUp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socialSignUp, isLoading } = useAuth();
  const { showToast } = useToast();

  // 🔧 상태 관리 개선
  const [isValidating, setIsValidating] = useState(true);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [userType, setUserType] = useState<'CONSUMER' | 'MANAGER' | null>(null);

  // 🔧 토큰 및 사용자 타입 검증 로직 개선
  useEffect(() => {
    const validateAccess = () => {
      console.log('🔍 SocialSignUp 접근 검증 시작');

      // 1. location.state에서 먼저 확인
      let token = location.state?.tempToken;
      let type = location.state?.userType;

      // 2. localStorage에서 확인
      if (!token) {
        token = localStorage.getItem('tempSocialToken');
        type = localStorage.getItem('tempUserType') as 'CONSUMER' | 'MANAGER';
      }

      if (token && type) {
        setTempToken(token);
        setUserType(type);
        setIsValidating(false);
      } else {
        showToast('잘못된 접근입니다.', 'error');
        navigate(ROUTES.LOGIN, { replace: true });
      }
    };

    // 🔧 약간의 지연을 두고 검증 (OAuth 처리 완료 대기)
    const timer = setTimeout(validateAccess, 200);

    return () => clearTimeout(timer);
  }, [location.state, navigate, showToast]);

  const { values, errors, touched, handleSubmit, setValue, setFieldTouched } =
    useForm<SocialSignUpRequestDto>({
      initialValues: {
        birth: '',
        gender: 'MALE',
      },
      validationSchema: {
        birth: (value) => value.length === 10, // YYYY-MM-DD
      },
      onSubmit: async (formData) => {
        if (!tempToken || !userType) {
          console.error('❌ 임시 토큰 또는 사용자 타입이 없습니다:', {
            tempToken: !!tempToken,
            userType,
          });
          showToast('인증 정보가 없습니다.', 'error');
          navigate(ROUTES.LOGIN);
          return;
        }

        const result = await socialSignUp(formData);

        if (result.success) {
          navigate(ROUTES.HOME, { replace: true });
        } else {
          showToast(result.error || '회원가입에 실패했습니다.', 'error');
        }
      },
    });

  // 생년월일 포맷팅
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

  // 🔧 검증 중 로딩 화면
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">정보를 확인 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white px-4 py-3 flex items-center shadow-sm">
        <button
          onClick={() => navigate(ROUTES.LOGIN)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 ml-3">
          추가 정보 입력
        </h1>
      </header>

      <main className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                안녕하세요!
              </h2>
              <p className="text-gray-600">
                {userType === 'CONSUMER' ? '회원' : '매니저'} 가입을 위해 추가
                정보를 입력해주세요.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 성별 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                성별 <span className="text-red-500">*</span>
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
                생년월일 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={values.birth}
                onChange={(e) => handleBirthChange(e.target.value)}
                onBlur={() => setFieldTouched('birth')}
                placeholder="1990-01-01"
                maxLength={10}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  errors.birth && touched.birth
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {errors.birth && touched.birth && (
                <p className="text-red-500 text-sm">
                  올바른 생년월일을 입력해주세요.
                </p>
              )}
            </div>

            {/* 회원가입 완료 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-lg transition-colors relative"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  가입 완료 중...
                </div>
              ) : (
                '회원가입 완료'
              )}
            </button>

            {/* 안내 메시지 */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                이미 계정이 있으시다면{' '}
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.LOGIN)}
                  className="text-orange-500 font-medium hover:underline"
                >
                  로그인
                </button>
                해주세요.
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SocialSignUp;
