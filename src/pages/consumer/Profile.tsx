import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, User } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useConsumer } from '@/hooks/useConsumer';
import type { ConsumerProfileRequestDto } from '@/apis/consumer';
import { ROUTES } from '@/constants';
import { uploadToS3 } from '@/utils/s3';

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState({ address: '', detailAddress: '' });
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      // 파일 크기 검증 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        showToast('이미지 크기는 5MB 이하로 업로드해주세요.', 'error');
        return;
      }

      // 이미지 타입 검증
      if (!file.type.startsWith('image/')) {
        showToast('이미지 파일만 업로드 가능합니다.', 'error');
        return;
      }

      setUploadingImage(true);
      try {
        // 미리보기 설정
        const previewUrl = URL.createObjectURL(file);
        setPreviewImage(previewUrl);

        // S3 업로드
        const { url } = await uploadToS3(file);

        setFormData((prev: ProfileData) => ({ ...prev, profileImage: url }));
        showToast('프로필 이미지가 업로드되었습니다.', 'success');
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        showToast('이미지 업로드에 실패했습니다.', 'error');
        setPreviewImage('');
      } finally {
        setUploadingImage(false);
      }
    };
    input.click();
  };

  const isFormValid = (): boolean => {
    return !errors.address && !errors.detailAddress;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.address || !formData.detailAddress) {
      showToast('주소를 입력해주세요.', 'error');
      return;
    }

    try {
      const profileData: ConsumerProfileRequestDto = {
        profileImage: formData.profileImage,
        address: formData.address,
        detailAddress: formData.detailAddress
      };

      console.log('프로필 업데이트 요청 데이터:', profileData);
      await updateProfile(profileData);
      await fetchProfile();  // Refresh profile data
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={() => navigate(ROUTES.CONSUMER.MYPAGE)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">프로필 수정</h1>
        <div className="w-10" />
      </div>

      <div className="px-4 py-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* 프로필 이미지 */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {previewImage || formData.profileImage ? (
                  <img
                    src={imageError ? DEFAULT_PROFILE_IMAGE : (previewImage || formData.profileImage)}
                    alt="프로필"
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <button
                onClick={handleImageUpload}
                disabled={uploadingImage}
                className={`absolute -bottom-2 -right-2 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg transition-colors ${
                  uploadingImage
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-orange-600'
                }`}
              >
                {uploadingImage ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              프로필 사진을 설정해주세요
            </p>
            <p className="text-xs text-gray-400">(선택사항)</p>
          </div>

          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 text-center">
              기본 정보
            </h3>

            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  휴대폰 번호
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  disabled
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <input
                  type="text"
                  value={formData.name}
                  disabled
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  성별
                </label>
                <input
                  type="text"
                  value={formData.gender === 'MALE' ? '남성' : '여성'}
                  disabled
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  생년월일
                </label>
                <input
                  type="text"
                  value={formData.birth}
                  disabled
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* 주소 설정 */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 text-center">
              주소 설정
            </h3>

            {/* 주소 입력 필드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주소 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="서울특별시 서초구"
                className={`w-full p-3 border rounded-lg transition-colors ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>

            {/* 상세 주소 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상세 주소 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.detailAddress}
                onChange={(e) => handleInputChange('detailAddress', e.target.value)}
                placeholder="상세 주소를 입력해주세요"
                className={`w-full p-3 border rounded-lg transition-colors ${
                  errors.detailAddress ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.detailAddress && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.detailAddress}
                </p>
              )}
            </div>
          </div>

          {/* 완료 버튼 */}
          <div className="pt-6">
            <button
              onClick={handleSubmit}
              disabled={!isFormValid() || loading || uploadingImage}
              className={`w-full py-4 rounded-lg font-medium transition-colors ${
                isFormValid() && !loading && !uploadingImage
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading || uploadingImage ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {uploadingImage ? '이미지 업로드 중...' : '저장 중...'}
                </div>
              ) : (
                '저장하기'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 