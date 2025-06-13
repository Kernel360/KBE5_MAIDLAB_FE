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
import { useAuth, useEvent } from '@/hooks';
import { ManagerFooter } from '@/components/layout/BottomNavigation/BottomNavigation';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userType } = useAuth();
  const { activeEvents, loading: eventsLoading } = useEvent();

  const handleServiceClick = (serviceType: string) => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    navigate(ROUTES.CONSUMER.RESERVATION_CREATE, {
      state: { serviceType },
    });
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleEventClick = (eventId: number) => {
    navigate(`${ROUTES.EVENTS}/${eventId}`);
  };

  // 알림 클릭 핸들러 (나중에 알림 페이지 연결)
  const handleNotificationClick = () => {
    console.log('알림 클릭');
    // navigate('/notifications'); // 알림 페이지가 있다면
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showNotification={true}
        onNotificationClick={handleNotificationClick}
        // onLogoClick={() => navigate(ROUTES.HOME)} // 기본 동작과 동일하므로 생략 가능
      />

      <main className="px-4 py-6 pb-20">
        {/* 가운데 정렬을 위한 컨테이너 추가 */}
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

      {/* FooterSwitcher: userType이 MANAGER면 ManagerFooter, 아니면 기존 BottomNavigation */}
      {userType === 'MANAGER' ? (
        <ManagerFooter />
      ) : (
        <BottomNavigation
          activeTab="home"
          onTabClick={handleNavigation}
          isAuthenticated={isAuthenticated}
        />
      )}
    </div>
  );
};

export default Home;
