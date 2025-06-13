import React from 'react';
import styled from 'styled-components';
import type { ConsumerMyPageDto } from '@/apis/consumer';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 32px 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ProfileImage = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  background-color: #F3F4F6;
  border: 2px solid #FDBA74;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &::before {
    content: '프로필';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #6B7280;
    font-size: 14px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
  }
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
`;

const UserName = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1F2937;
  text-align: center;
`;

const UserPoint = styled.p`
  margin: 0;
  color: #6B7280;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
`;

const EditButton = styled.button`
  width: 100%;
  max-width: 200px;
  padding: 12px 20px;
  background: #F97316;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #EA580C;
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
      <ProfileImage>
        <img 
          src={userInfo?.profileImage || '/default-profile.png'} 
          alt=""
        />
      </ProfileImage>
      <ProfileInfo>
        <UserName>{userInfo?.name || '사용자'}</UserName>
        <UserPoint>포인트: {userInfo?.point || 0}P</UserPoint>
        <EditButton onClick={handleEditClick}>프로필 편집</EditButton>
      </ProfileInfo>
    </Section>
  );
};