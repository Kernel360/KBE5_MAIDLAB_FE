import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useConsumer } from '@/hooks/useConsumer';
import type { ConsumerProfileRequestDto } from '@/apis/consumer';
import { useNavigate } from 'react-router-dom';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &.primary {
    background: #007bff;
    color: white;

    &:hover {
      background: #0056b3;
    }
  }

  &.secondary {
    background: #6c757d;
    color: white;

    &:hover {
      background: #545b62;
    }
  }
`;

interface ProfileFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ onSuccess, onCancel }) => {
  const { profile, fetchProfile, updateProfile, loading } = useConsumer();
  const [formData, setFormData] = useState<ConsumerProfileRequestDto>({
    address: '',
    detailAddress: '',
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        address: profile.address || '',
        detailAddress: profile.detailAddress || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await updateProfile(formData);
    if (result.success) {
      onSuccess();
    }
  };

  if (loading || !profile) {
    return <div>로딩중...</div>;
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Label>이름</Label>
        <Input type="text" value={profile.name} disabled />
      </FormGroup>
      <FormGroup>
        <Label>전화번호</Label>
        <Input type="tel" value={profile.phoneNumber} disabled />
      </FormGroup>
      <FormGroup>
        <Label>주소</Label>
        <Input 
          type="text" 
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
        />
      </FormGroup>
      <FormGroup>
        <Label>상세주소</Label>
        <Input 
          type="text" 
          value={formData.detailAddress}
          onChange={(e) => setFormData({...formData, detailAddress: e.target.value})}
        />
      </FormGroup>
      <ButtonGroup>
        <Button type="submit" className="primary">저장하기</Button>
        <Button 
          type="button" 
          className="secondary"
          onClick={onCancel}
        >
          취소
        </Button>
      </ButtonGroup>
    </Form>
  );
};

const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/mypage');
  };

  const handleCancel = () => {
    navigate('/mypage');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ marginBottom: '30px' }}>프로필 수정</h1>
      <ProfileForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
};

export default ProfileEditPage;