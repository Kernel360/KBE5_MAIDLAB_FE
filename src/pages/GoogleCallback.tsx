import React, { useEffect, useState } from 'react';
import { handleGoogleOAuthCallback } from '@/utils/googleOAuth';

const GoogleCallback: React.FC = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>(
    'processing',
  );
  const [message, setMessage] = useState('로그인 처리 중...');

  useEffect(() => {
    try {
      handleGoogleOAuthCallback();
      setStatus('success');
      setMessage('로그인 처리가 완료되었습니다.');

      // 3초 후 팝업 닫기 시도
      setTimeout(() => {
        try {
          window.close();
        } catch (error) {
          setMessage('이 창을 닫아주세요.');
        }
      }, 3000);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      setStatus('error');
      setMessage('로그인 처리 중 오류가 발생했습니다.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center p-8">
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              로그인 처리 중...
            </h2>
            <p className="text-sm text-gray-600">잠시만 기다려주세요.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              처리 완료
            </h2>
            <p className="text-sm text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => window.close()}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              창 닫기
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              오류 발생
            </h2>
            <p className="text-sm text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => window.close()}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              창 닫기
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;
