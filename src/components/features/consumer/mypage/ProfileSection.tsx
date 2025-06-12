import React from 'react';
import styled from 'styled-components';
import type { ConsumerMyPageDto } from '@/apis/consumer';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';

const Section = styled.section`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #f0f0f0;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h2`
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
`;

const UserPoint = styled.p`
  margin: 0;
  color: #666;
  font-size: 16px;
`;

const EditButton = styled.button`
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #0056b3;
  }
`;

interface ProfileSectionProps {
  userInfo: ConsumerMyPageDto | null;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ userInfo }) => {
  const navigate = useNavigate();

  const handleEditClick = () => {
    navigate(ROUTES.CONSUMER.PROFILE);
  };

  return (
    <Section>
      <ProfileImage 
        src={userInfo?.profileImage || '/default-profile.png'} 
        alt="프로필"
      />
      <ProfileInfo>
        <UserName>{userInfo?.name || '사용자'}</UserName>
        <UserPoint>포인트: {userInfo?.point || 0}P</UserPoint>
        <EditButton onClick={handleEditClick}>프로필 편집</EditButton>
      </ProfileInfo>
    </Section>
  );
};