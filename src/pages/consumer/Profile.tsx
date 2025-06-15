import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { useConsumer } from '@/hooks/useConsumer';
import type { ConsumerProfileRequestDto } from '@/apis/consumer';
import { ROUTES } from '@/constants';
import { uploadToS3 } from '@/utils/s3';

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
  const { profile, fetchProfile, updateProfile, loading } = useConsumer();
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
  const [isEditing, setIsEditing] = useState(false);

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File size validation (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showToast('이미지 크기는 5MB 이하로 업로드해주세요.', 'error');
      return;
    }

    // Image type validation
    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일만 업로드 가능합니다.', 'error');
      return;
    }

    // Generate preview URL for the selected image
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);

    try {
      // S3 upload only
      const { url } = await uploadToS3(file);
      console.log('S3에 저장된 URL:', url);

      // Update formData with the new image URL
      setFormData(prev => ({
        ...prev,
        profileImage: url
      }));

      showToast('이미지가 업로드되었습니다. 저장 버튼을 눌러 변경사항을 적용해주세요.', 'success');
    } catch (error: any) {
      showToast(error.message || '이미지 업로드에 실패했습니다.', 'error');
      // Remove preview on error
      setPreviewImage(undefined);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.address || !formData.detailAddress) {
      showToast('주소를 입력해주세요.', 'error');
      return;
    }

    try {
      const profileData: ConsumerProfileRequestDto = {
        profileImage: formData.profileImage,  // Include the image URL from formData
        address: formData.address,
        detailAddress: formData.detailAddress
      };

      console.log('프로필 업데이트 요청 데이터:', profileData);
      const result = await updateProfile(profileData);
      
      if (result.success) {
        showToast('프로필이 업데이트되었습니다.', 'success');
        setIsEditing(false);
        await fetchProfile();  // Refresh profile data
      }
    } catch (error: any) {
      showToast(error.message || '프로필 업데이트에 실패했습니다.', 'error');
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

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setPreviewImage(undefined);
    // Reset form data to original profile data
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
  };

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

        <SaveButton onClick={handleSubmit}>저장하기</SaveButton>
      </ProfileCard>
    </ProfileContainer>
  );
};

export default Profile; 