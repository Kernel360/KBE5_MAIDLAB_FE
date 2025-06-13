import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useConsumer } from '@/hooks/useConsumer';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { ProfileSection } from '@/components/features/consumer/mypage/ProfileSection';
import MenuGrid from '@/components/features/consumer/mypage/MenuGrid';
import type { ConsumerMyPageDto } from '@/apis/consumer';
import { ROUTES } from '@/constants';
import { CONFIRM_MESSAGES } from '@/constants/message';

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const Header = styled.header`
  position: fixed;s
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  z-index: 100;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #333;
  font-size: 16px;
  
  &:hover {
    color: #666;
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  
  &:hover {
    color: #333;
  }
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 76px 20px 20px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-size: 18px;
  color: #666;
`;

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchMypage, loading } = useConsumer();
  const { logout } = useAuth();
  const { showToast } = useToast();
  const [userInfo, setUserInfo] = useState<ConsumerMyPageDto | null>(null);

  useEffect(() => {
    const loadUserInfo = async () => {
      const data = await fetchMypage();
      if (data) {
        setUserInfo(data);
      }
    };
    loadUserInfo();
  }, [fetchMypage]);

  const handleBack = () => {
    navigate(ROUTES.HOME);
  };

  const handleLogout = async () => {
    if (window.confirm(CONFIRM_MESSAGES.LOGOUT)) {
      try {
        await logout();
        showToast('로그아웃되었습니다.', 'success');
        navigate(ROUTES.HOME);
      } catch (error) {
        showToast('로그아웃 중 오류가 발생했습니다.', 'error');
      }
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        로딩중...
      </LoadingContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </BackButton>
        <h1 style={{ fontSize: '18px', fontWeight: '600' }}>마이페이지</h1>
        <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
      </Header>
      <ContentContainer>
        <ProfileSection userInfo={userInfo} />
        <MenuGrid />
      </ContentContainer>
    </PageContainer>
  );
};

export default MyPage;