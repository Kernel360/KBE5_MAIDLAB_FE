import React from 'react';
import { useAuth } from '@/hooks';
import ManagerHome from '../manager/ManagerHome';
// import ConsumerHome from '../consumer/ConsumerHome';
import GuestHome from './GuestHome';

const Home: React.FC = () => {
  const { userType, isAuthenticated } = useAuth();

  // 매니저로 로그인한 경우
  if (isAuthenticated && userType === 'MANAGER') {
    return <ManagerHome />;
  }

  // 소비자로 로그인한 경우
  // if (isAuthenticated && userType === 'CONSUMER') {
  //   return <ConsumerHome />;
  // }

  // 비로그인 상태 (게스트)
  return <GuestHome />;
};

export default Home;