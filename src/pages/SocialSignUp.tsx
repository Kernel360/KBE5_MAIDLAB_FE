import React, { useEffect } from 'react';
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

  // URL state나 localStorage에서 임시 토큰과 사용자 정보 가져오기
  const tempToken =
    location.state?.tempToken || localStorage.getItem('tempSocialToken');
  const userType =
    location.state?.userType ||
    (localStorage.getItem('tempUserType') as 'CONSUMER' | 'MANAGER');

  // 프로필 설정 페이지로 이동하는 함수
  const navigateToProfileSetup = (userType: 'CONSUMER' | 'MANAGER') => {
    const route =
      userType === 'MANAGER'
        ? ROUTES.MANAGER.PROFILE_SETUP
        : ROUTES.CONSUMER.PROFILE_SETUP;

    navigate(route, { replace: true });
  };

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
        if (!tempToken) {
          console.error('임시 토큰이 없습니다.');
          showToast('인증 정보가 없습니다.', 'error');
          navigate(ROUTES.LOGIN);
          return;
        }

        const result = await socialSignUp(formData);

        if (result.success) {
          showToast(
            '회원가입이 완료되었습니다. 프로필을 설정해주세요.',
            'success',
          );

          // 자동 로그인이 완료된 상태이므로 바로 프로필 설정으로 이동
          setTimeout(() => {
            navigateToProfileSetup(userType);
          }, 1500);
        } else {
          console.error('소셜 회원가입 실패:', result);
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

  // 임시 토큰이 없으면 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!tempToken) {
      showToast('잘못된 접근입니다.', 'error');
      navigate(ROUTES.LOGIN);
    }
  }, [tempToken, navigate, showToast]);

  if (!tempToken) {
    return null;
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
