import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, User } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useConsumer } from '@/hooks/domain/useConsumer';
import { validateBirthDate } from '@/constants/validation';
import { validatePhone } from '@/utils/validation';
import type {
  ConsumerProfileUpdateRequest,
  ProfileData,
} from '@/types/domain/consumer';
import { ROUTES } from '@/constants';
import { uploadToS3 } from '@/utils/s3';
import { Header } from '@/components/layout/Header/Header';

const DEFAULT_PROFILE_IMAGE = '/default-profile.png';

const ProfileEdit: React.FC = () => {
  const { profile, fetchProfile, updateProfile, loading } = useConsumer();
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    birth: '',
    gender: 'MALE',
    address: '',
    detailAddress: '',
    profileImage: undefined,
  });
  const [previewImage, setPreviewImage] = useState<string | undefined>(
    undefined,
  );
  const [imageError, setImageError] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    gender: '',
    birth: '',
    address: '',
    detailAddress: '',
    emergencyCall: '',
  });

  // 1. Add a new state to store the selected image file
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

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
        birth: profile.birth || '',
        gender: profile.gender || 'MALE',
        address: profile.address || '',
        detailAddress: profile.detailAddress || '',
        profileImage: profile.profileImage,
        emergencyCall: profile.emergencyCall || undefined,
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    // 비상연락처는 숫자만 입력 가능
    if (field === 'emergencyCall') {
      const numbers = value.replace(/[^0-9]/g, '');
      if (numbers.length > 11) return;
      setFormData((prev) => ({
        ...prev,
        [field]: numbers,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    // 에러 메시지 초기화
    if (field === 'address' && errors.address) {
      setErrors((prev) => ({ ...prev, address: '' }));
    }
    if (field === 'detailAddress' && errors.detailAddress) {
      setErrors((prev) => ({ ...prev, detailAddress: '' }));
    }
    if (field === 'emergencyCall' && errors.emergencyCall) {
      setErrors((prev) => ({ ...prev, emergencyCall: '' }));
    }
  };

  // 2. Update handleImageUpload to only set the file and preview, not upload to S3
  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
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

      // 미리보기 설정
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      setSelectedImageFile(file);
    };
    input.click();
  };

  const isFormValid = (): boolean => {
    const baseValid = (
      !errors.address &&
      !errors.detailAddress &&
      formData.address.trim() !== '' &&
      formData.detailAddress.trim() !== ''
    );
    
    // 소셜 로그인 사용자는 비상연락처도 필수
    if (formData.emergencyCall !== undefined) {
      return baseValid && !errors.emergencyCall && formData.emergencyCall.trim() !== '';
    }
    
    return baseValid;
  };

  // 생년월일 자동 하이픈 처리
  const handleBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    if (value.length > 4) value = value.slice(0, 4) + '-' + value.slice(4);
    if (value.length > 7) value = value.slice(0, 7) + '-' + value.slice(7);
    setFormData((prev) => ({ ...prev, birth: value }));
  };

  // 3. In handleSubmit, upload the image to S3 if a new file is selected, then send the API request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    const newErrors = {
      name: '',
      gender: '',
      birth: '',
      address: '',
      detailAddress: '',
      emergencyCall: '',
    };
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }
    if (!formData.gender) {
      newErrors.gender = '성별을 선택해주세요.';
    }
    if (!formData.birth.trim()) {
      newErrors.birth = '생년월일을 입력해주세요.';
    } else {
      const birthValidation = validateBirthDate(formData.birth);
      if (!birthValidation.isValid) {
        newErrors.birth =
          birthValidation.error || '올바른 생년월일을 입력해주세요.';
      }
    }
    if (!formData.address.trim()) {
      newErrors.address = '주소를 입력해주세요.';
    }
    if (!formData.detailAddress.trim()) {
      newErrors.detailAddress = '상세 주소를 입력해주세요.';
    }
    // 소셜 로그인 사용자는 비상연락처 필수
    if (formData.emergencyCall !== undefined) {
      if (!formData.emergencyCall?.trim()) {
        newErrors.emergencyCall = '비상연락처를 입력해주세요.';
      } else if (!validatePhone(formData.emergencyCall)) {
        newErrors.emergencyCall = '올바른 휴대폰 번호를 입력해주세요. (예: 01012345678)';
      }
    }

    if (Object.values(newErrors).some((v) => v)) {
      setErrors(newErrors);
      return;
    }

    try {
      let profileImageUrl = formData.profileImage;
      if (selectedImageFile) {
        setUploadingImage(true);
        const { url } = await uploadToS3(selectedImageFile);
        profileImageUrl = url;
        setUploadingImage(false);
      }
      const profileData: ConsumerProfileUpdateRequest = {
        name: formData.name,
        gender: formData.gender,
        birth: formData.birth,
        profileImage: profileImageUrl,
        address: formData.address,
        detailAddress: formData.detailAddress,
        ...(formData.emergencyCall !== undefined && { emergencyCall: formData.emergencyCall }),
      };
      await updateProfile(profileData);
      navigate(ROUTES.CONSUMER.PROFILE);
    } catch (error: any) {
      setUploadingImage(false);
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
    <div className="min-h-screen bg-gray-50">
      <Header
        variant="sub"
        title="프로필 수정"
        backRoute={ROUTES.CONSUMER.PROFILE}
        showMenu={true}
      />

      <main className="px-4 py-6 pb-20">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-8">
            {/* 프로필 이미지 */}
            <div className="text-center mb-4">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {previewImage || formData.profileImage ? (
                    <img
                      src={
                        imageError
                          ? DEFAULT_PROFILE_IMAGE
                          : previewImage || formData.profileImage
                      }
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
            </div>

            {/* 프로필 정보 */}
            <div className="space-y-4 bg-white rounded-lg">
              {/* 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-3 border text-center border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* 성별 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  성별
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange('gender', 'MALE')}
                    className={`flex-1 py-2 rounded-lg border text-center font-medium transition-all ${formData.gender === 'MALE' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-400'}`}
                  >
                    남성
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('gender', 'FEMALE')}
                    className={`flex-1 py-2 rounded-lg border text-center font-medium transition-all ${formData.gender === 'FEMALE' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-400'}`}
                  >
                    여성
                  </button>
                </div>
                {errors.gender && (
                  <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                )}
              </div>

              {/* 생년월일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  생년월일
                </label>
                <input
                  type="text"
                  value={formData.birth}
                  onChange={handleBirthChange}
                  placeholder="YYYY-MM-DD"
                  className="w-full p-3 border text-center border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                  maxLength={10}
                  inputMode="numeric"
                  autoComplete="bday"
                />
                {errors.birth && (
                  <p className="text-red-500 text-sm mt-1">{errors.birth}</p>
                )}
              </div>

              {/* 주소 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주소
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="서울특별시 서초구"
                  className="w-full p-3 border text-center border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              {/* 상세 주소 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상세 주소
                </label>
                <input
                  type="text"
                  value={formData.detailAddress}
                  onChange={(e) =>
                    handleInputChange('detailAddress', e.target.value)
                  }
                  placeholder="상세 주소를 입력해주세요"
                  className="w-full p-3 border text-center border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
                {errors.detailAddress && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.detailAddress}
                  </p>
                )}
              </div>

              {/* 비상연락처 - 소셜 로그인 사용자만 표시 */}
              {formData.emergencyCall !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비상연락처 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyCall || ''}
                    onChange={(e) =>
                      handleInputChange('emergencyCall', e.target.value)
                    }
                    placeholder="01012345678"
                    maxLength={11}
                    className={`w-full p-3 border text-center rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.emergencyCall ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.emergencyCall && (
                    <p className="text-red-500 text-sm mt-1">{errors.emergencyCall}</p>
                  )}
                </div>
              )}
            </div>

            {/* 버튼 그룹 */}
            <div className="pt-1 space-y-3">
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

              <button
                onClick={() => navigate(ROUTES.CONSUMER.PROFILE)}
                className="w-full py-4 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileEdit;
