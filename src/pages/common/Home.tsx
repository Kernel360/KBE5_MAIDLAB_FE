import React from 'react';
import { useAuth } from '@/hooks';
import ManagerHome from '../manager/ManagerHome';
import GuestHome from './GuestHome';

// TODO - 나중에 이름 바꾸기
import ConsumerMain from '../consumer/ConsumerMain';

const Home: React.FC = () => {
  const { userType, isAuthenticated } = useAuth();

  // 매니저로 로그인한 경우
  if (isAuthenticated && userType === 'MANAGER') {
    return <ManagerHome />;
  }

  // 소비자로 로그인한 경우
  if (isAuthenticated && userType === 'CONSUMER') {
    return <ConsumerMain />;
  }

  // 비로그인 상태 (게스트)
  return <GuestHome />;
};

export default Home;