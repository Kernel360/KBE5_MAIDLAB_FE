import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Header,
  BottomNavigation,
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

  const handleNavigation = (path: string) => {
    navigate(path);
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

          <PromotionBanner
            title="회원가입 혜택"
            subtitle="지금 가입하고 포인트 받기"
            discount="1000P"
            onClick={() => navigate(ROUTES.SIGNUP)}
          />
        </div>
      </main>

      {/* 비로그인 상태이므로 isAuthenticated=false */}
      <BottomNavigation
        activeTab="home"
        onTabClick={handleNavigation}
        isAuthenticated={false}
      />
    </div>
  );
};

export default GuestHome;
