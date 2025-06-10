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
import { useAuth } from '@/hooks';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showNotification={true}
        onNotificationClick={() => console.log('알림 클릭')}
      />

      <main className="px-4 py-6 pb-20">
        <HeroSection />

        <ServiceGrid onServiceClick={handleServiceClick} />

        <PromotionBanner
          title="첫 예약 20% 할인"
          subtitle="신규 가입 고객 한정"
          discount="20%"
          onClick={() => navigate(ROUTES.SIGNUP)}
        />
      </main>

      <BottomNavigation
        activeTab="home"
        onTabClick={handleNavigation}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
};

export default Home;
