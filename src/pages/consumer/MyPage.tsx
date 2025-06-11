import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
// import { useConsumer } from '@/hooks/useConsumer';
import { ProfileSection } from '@/components/features/consumer/mypage/ProfileSection';
import MenuGrid from '@/components/features/consumer/mypage/MenuGrid';
import type { ConsumerMyPageDto } from '@/apis/consumer';

const MyPageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-size: 18px;
  color: #666;
`;

// 테스트용 목 데이터
const mockUserInfo: ConsumerMyPageDto = {
  name: '홍길동',
  point: 1000,
  profileImage: undefined
};

const MyPage: React.FC = () => {
  // const { fetchMypage, loading } = useConsumer();
  const [userInfo, setUserInfo] = useState<ConsumerMyPageDto | null>(mockUserInfo);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // API 호출 주석 처리
    /*
    const loadUserInfo = async () => {
      const data = await fetchMypage();
      if (data) {
        setUserInfo(data);
      }
    };
    loadUserInfo();
    */
  }, []);

  if (loading) {
    return (
      <LoadingContainer>
        로딩중...
      </LoadingContainer>
    );
  }

  return (
    <MyPageContainer>
      <ProfileSection userInfo={userInfo} />
      <MenuGrid />
    </MyPageContainer>
  );
};

export default MyPage;