import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useToast } from '@/hooks/useToast';

const ProfileContainer = styled.div`
  max-width: 600px;
  margin: 40px auto;
  padding: 0 20px;
`;

const ProfileCard = styled.div`
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ProfileHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #333;
`;

const SaveButton = styled.button`
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #218838;
  }
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

const ProfileImage = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  background-color: #e9ecef;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: #6c757d;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  &:hover::after {
    content: '이미지 변경';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 4px;
    font-size: 12px;
    text-align: center;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  input[type="file"] {
    display: none;
  }
`;

const InfoGroup = styled.div`
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const Label = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
`;

const Value = styled.div`
  font-size: 16px;
  color: #333;
  font-weight: 500;
`;

const Input = styled.input`
  font-size: 16px;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  width: 100%;
  margin-top: 4px;
  &:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
  }
`;

interface ProfileData {
  name: string;
  phoneNumber: string;
  birth: string;
  gender: 'MALE' | 'FEMALE';
  address: string;
  detailAddress: string;
  profileImage: string | undefined;
}

// Mock data
const initialProfile: ProfileData = {
  name: '홍길동',
  phoneNumber: '010-1234-5678',
  birth: '1990-01-01',
  gender: 'MALE',
  address: '서울시 강남구 테헤란로 123',
  detailAddress: '123동 456호',
  profileImage: undefined
};

const DEFAULT_PROFILE_IMAGE = '/default-profile.png';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const { showToast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      // TODO: API 호출 구현
      // await consumerApi.updateProfile({
      //   address: profile.address,
      //   detailAddress: profile.detailAddress
      // });
      showToast('프로필이 수정되었습니다.', 'success');
    } catch (error: any) {
      showToast(error.message || '프로필 수정에 실패했습니다.', 'error');
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // TODO: 이미지 업로드 API 구현
      // const formData = new FormData();
      // formData.append('image', file);
      // const imageUrl = await uploadApi.uploadImage(formData);

      const imageUrl = URL.createObjectURL(file); // 임시로 로컬 URL 사용
      setProfile(prev => ({
        ...prev,
        profileImage: imageUrl
      }));
      showToast('프로필 이미지가 변경되었습니다.', 'success');
    } catch (error: any) {
      showToast(error.message || '이미지 업로드에 실패했습니다.', 'error');
    }
  };

  return (
    <ProfileContainer>
      <ProfileCard>
        <ProfileHeader>
          <Title>프로필</Title>
          <SaveButton onClick={handleSave}>저장하기</SaveButton>
        </ProfileHeader>

        <label htmlFor="profile-image">
          <ProfileImage>
            <img 
              src={profile.profileImage || DEFAULT_PROFILE_IMAGE} 
              alt="프로필 이미지" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = DEFAULT_PROFILE_IMAGE;
              }}
            />
            <input
              id="profile-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </ProfileImage>
        </label>

        <InfoGroup>
          <Label>휴대폰 번호</Label>
          <Value>{profile.phoneNumber}</Value>
        </InfoGroup>

        <InfoGroup>
          <Label>이름</Label>
          <Value>{profile.name}</Value>
        </InfoGroup>

        <InfoGroup>
          <Label>성별</Label>
          <Value>{profile.gender === 'MALE' ? '남성' : '여성'}</Value>
        </InfoGroup>

        <InfoGroup>
          <Label>생년월일</Label>
          <Value>{profile.birth}</Value>
        </InfoGroup>

        <InfoGroup>
          <Label>주소</Label>
          <Input
            value={profile.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="주소를 입력해주세요"
          />
        </InfoGroup>

        <InfoGroup>
          <Label>상세주소</Label>
          <Input
            value={profile.detailAddress}
            onChange={(e) => handleInputChange('detailAddress', e.target.value)}
            placeholder="상세주소를 입력해주세요"
          />
        </InfoGroup>
      </ProfileCard>
    </ProfileContainer>
  );
};

export default Profile; 