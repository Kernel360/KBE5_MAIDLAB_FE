import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { useConsumer } from '@/hooks/useConsumer';
import type { ConsumerProfileRequestDto } from '@/apis/consumer';
import { ROUTES } from '@/constants';

const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7280;
  transition: color 0.2s;
  z-index: 10;

  &:hover {
    color: #F97316;
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const ProfileContainer = styled.div`
  max-width: 600px;
  margin: 40px auto;
  position: relative;
  padding: 0 20px;
`;

const ProfileCard = styled.div`
  background: #FFFFFF;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08);
`;

const ProfileHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #E5E7EB;
  position: relative;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #1F2937;
  text-align: center;
`;

const SaveButton = styled.button`
  width: 100%;
  padding: 14px 20px;
  background: #F97316;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 5px;
  
  &:hover {
    background: #EA580C;
  }
  
  &:disabled {
    background: #9CA3AF;
    cursor: not-allowed;
  }
`;

const ProfileImage = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  background-color: #F3F4F6;
  margin: 0 auto 32px;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border: 1px solid #FDBA74;

  &::before {
    content: '이미지';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #6B7280;
    font-size: 14px;
  }

  &:hover::after {
    content: '이미지 변경';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 6px;
    font-size: 13px;
    font-weight: 500;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 28px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
  }

  input[type="file"] {
    display: none;
  }
`;

const InfoGroup = styled.div`
  margin-bottom: 24px;
  padding: 20px;
  background: #F9FAFB;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
`;

const Label = styled.div`
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 6px;
  font-weight: 500;
`;

const Value = styled.div`
  font-size: 16px;
  color: #1F2937;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  font-size: 14px;
  color: #1F2937;
  background-color: white;
  transition: all 0.2s;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #F97316;
    box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.1);
  }

  &::placeholder {
    color: #9CA3AF;
  }

  &:disabled {
    background-color: #F3F4F6;
    cursor: not-allowed;
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

const DEFAULT_PROFILE_IMAGE = '/default-profile.png';

const Profile: React.FC = () => {
  const { profile, fetchProfile, updateProfile, loading, error } = useConsumer();
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    phoneNumber: '',
    birth: '',
    gender: 'MALE',
    address: '',
    detailAddress: '',
    profileImage: undefined
  });
  const [previewImage, setPreviewImage] = useState<string | undefined>(undefined);
  const [imageError, setImageError] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  // 프로필 데이터 가져오기
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // 프로필 데이터가 변경되면 폼 데이터 업데이트
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phoneNumber: profile.phoneNumber || '',
        birth: profile.birth || '',
        gender: profile.gender || 'MALE',
        address: profile.address || '',
        detailAddress: profile.detailAddress || '',
        profileImage: profile.profileImage
      });
    }
  }, [profile]);

  // 에러 발생 시 토스트 메시지 표시
  useEffect(() => {
    if (error) {
      showToast(error.message || '프로필을 불러오는데 실패했습니다.', 'error');
    }
  }, [error, showToast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      const updateData: ConsumerProfileRequestDto = {
        address: formData.address,
        detailAddress: formData.detailAddress
      };
      await updateProfile(updateData);
      showToast('프로필이 수정되었습니다.', 'success');
    } catch (error: any) {
      showToast(error.message || '프로필 수정에 실패했습니다.', 'error');
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 선택한 이미지의 미리보기 URL 생성
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);

    try {
      const formData = new FormData();
      formData.append('image', file);
      // TODO: 이미지 업로드 API 구현 후 주석 해제
      // const imageUrl = await uploadApi.uploadImage(formData);
      // setFormData(prev => ({
      //   ...prev,
      //   profileImage: imageUrl
      // }));
      showToast('프로필 이미지가 변경되었습니다.', 'success');
    } catch (error: any) {
      showToast(error.message || '이미지 업로드에 실패했습니다.', 'error');
      // 에러 발생 시 미리보기 제거
      setPreviewImage(undefined);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!imageError) {
      setImageError(true);
      const target = e.target as HTMLImageElement;
      target.src = DEFAULT_PROFILE_IMAGE;
    }
  };

  // 이미지 URL이 변경될 때마다 에러 상태 초기화
  useEffect(() => {
    setImageError(false);
  }, [previewImage, formData.profileImage]);

  // 컴포넌트 언마운트 시 미리보기 URL 정리
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  if (loading) {
    return (
      <ProfileContainer>
        <ProfileCard>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            로딩중...
          </div>
        </ProfileCard>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <BackButton onClick={() => navigate(ROUTES.CONSUMER.MYPAGE)}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </BackButton>
      <ProfileCard>
        <ProfileHeader>
          <Title>프로필</Title>
        </ProfileHeader>

        <label htmlFor="profile-image">
          <ProfileImage>
            <img
              src={imageError ? DEFAULT_PROFILE_IMAGE : (previewImage || formData.profileImage || DEFAULT_PROFILE_IMAGE)}
              alt=""
              onError={handleImageError}
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
          <Value>{formData.phoneNumber}</Value>
        </InfoGroup>

        <InfoGroup>
          <Label>이름</Label>
          <Value>{formData.name}</Value>
        </InfoGroup>

        <InfoGroup>
          <Label>성별</Label>
          <Value>{formData.gender === 'MALE' ? '남성' : '여성'}</Value>
        </InfoGroup>

        <InfoGroup>
          <Label>생년월일</Label>
          <Value>{formData.birth}</Value>
        </InfoGroup>

        <InfoGroup>
          <Label>주소</Label>
          <Input
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="주소를 입력해주세요"
          />
        </InfoGroup>

        <InfoGroup>
          <Label>상세주소</Label>
          <Input
            value={formData.detailAddress}
            onChange={(e) => handleInputChange('detailAddress', e.target.value)}
            placeholder="상세주소를 입력해주세요"
          />
        </InfoGroup>

        <SaveButton onClick={handleSave}>저장하기</SaveButton>
      </ProfileCard>
    </ProfileContainer>
  );
};

export default Profile; 