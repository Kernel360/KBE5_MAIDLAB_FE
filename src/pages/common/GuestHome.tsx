import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, ServiceGrid, HeroSection } from '@/components';
import { ROUTES } from '@/constants';
import { useEvent } from '@/hooks';

const GuestHome: React.FC = () => {
  const navigate = useNavigate();
  const { activeEvents, loading: eventsLoading } = useEvent();

  // 비로그인 상태에서는 서비스 클릭시 로그인 페이지로
  const handleServiceClick = () => {
    navigate(ROUTES.LOGIN);
  };

  const handleEventClick = (eventId: number) => {
    navigate(`${ROUTES.EVENTS}/${eventId}`);
  };

  const handleNotificationClick = () => {
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showNotification={true}
        onNotificationClick={handleNotificationClick}
      />

      <main className="px-4 py-6 pb-20">
        <div className="max-w-md mx-auto">
          <HeroSection
            onEventClick={handleEventClick}
            events={activeEvents}
            loading={eventsLoading}
          />

          <ServiceGrid onServiceClick={handleServiceClick} />

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                왜 메이드랩을 선택해야 할까요?
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      전문 검증된 도우미
                    </h4>
                    <p className="text-sm text-gray-600">
                      신원 확인과 교육을 완료한 믿을 수 있는 전문가들
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      투명한 가격 시스템
                    </h4>
                    <p className="text-sm text-gray-600">
                      명확한 요금제로 숨겨진 비용 없이 이용 가능
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">만족도 보장</h4>
                    <p className="text-sm text-gray-600">
                      서비스 품질에 문제가 있다면 100% 재서비스 제공
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* TODO: 포인트 기능 추가시 활성화 */}
            {/* <div className="bg-white rounded-2xl p-6 border border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">🎁</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      신규 회원 혜택
                    </h3>
                    <p className="text-sm text-gray-600">
                      가입 즉시 포인트 지급
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-400">1000P</div>
                  <div className="text-xs text-gray-500">무료 지급</div>
                </div>
              </div>
              <button
                onClick={() => navigate(ROUTES.LOGIN)}
                className="w-full bg-orange-100 text-orange-500 font-semibold py-3 px-6 rounded-xl hover:bg-orange-200 transition-all duration-200 border border-orange-200"
              >
                로그인하고 혜택 받기
              </button>
            </div> */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GuestHome;
