import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Header,
  ServiceGrid,
  PromotionBanner,
  HeroSection,
} from '@/components';
import { ROUTES } from '@/constants';
import { useEvent } from '@/hooks';

const GuestHome: React.FC = () => {
  const navigate = useNavigate();
  const { activeEvents, loading: eventsLoading } = useEvent();

  // 비로그인 상태에서는 서비스 클릭시 로그인 페이지로
  const handleServiceClick = (serviceType: string) => {
    navigate(ROUTES.LOGIN, {
      state: { redirectTo: ROUTES.CONSUMER.RESERVATION_CREATE, serviceType },
    });
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

      <main className="px-4 py-6 pb-20 pt-20">
        <div className="max-w-md mx-auto">
          <HeroSection
            onEventClick={handleEventClick}
            events={activeEvents}
            loading={eventsLoading}
          />

          <ServiceGrid onServiceClick={handleServiceClick} />

          <PromotionBanner
            title="회원가입 혜택"
            subtitle="지금 가입하고 포인트 받기"
            discount="1000P"
            onClick={() => navigate(ROUTES.SIGNUP)}
          />
        </div>
      </main>
    </div>
  );
};

export default GuestHome;
