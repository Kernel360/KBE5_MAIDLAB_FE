import React, { useState } from 'react';
import { Upload, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ERROR_MESSAGES, ROUTES, VALIDATION_MESSAGES } from '@/constants';
import { useToast, useConsumer, useValidation } from '@/hooks';
import { uploadToS3 } from '@/utils/s3';
import type {
  ConsumerProfileCreateRequest,
  ConsumerProfileFormData,
  ConsumerProfileErrors,
} from '@/types/domain/consumer';
import { Header } from '@/components/layout/Header/Header';

const ConsumerProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { createProfile, loading } = useConsumer();
  const { validateForm } = useValidation();

  const [formData, setFormData] = useState<ConsumerProfileFormData>({
    profileImage: undefined,
    address: '',
    detailAddress: '',
  });

  const [errors, setErrors] = useState<ConsumerProfileErrors>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  // ✅ 프로필 체크 로직 제거됨 - ProtectedRoute에서 처리

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
        setImagePreview(previewUrl);

        // S3 업로드
        const { url } = await uploadToS3(file);

        setFormData((prev) => ({ ...prev, profileImage: url }));
        showToast('프로필 이미지가 업로드되었습니다.', 'success');
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        showToast('이미지 업로드에 실패했습니다.', 'error');
        setImagePreview('');
      } finally {
        setUploadingImage(false);
      }
    };
    input.click();
  };

  const validateFormData = (): boolean => {
    const rules = {
      address: 'required' as const,
      detailAddress: 'required' as const,
    };

    const { isValid, errors: validationErrors } = validateForm(formData, rules);

    // 커스텀 에러 메시지 적용
    const newErrors: ConsumerProfileErrors = {};
    if (validationErrors.address) {
      newErrors.address = '주소를 선택해주세요.';
    }
    if (validationErrors.detailAddress) {
      newErrors.detailAddress = VALIDATION_MESSAGES.ADDRESS.REQUIRED;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateFormData()) return;

    try {
      const profileData: ConsumerProfileCreateRequest = {
        profileImage: formData.profileImage,
        address: formData.address,
        detailAddress: formData.detailAddress,
      };

      const result = await createProfile(profileData);

      if (result?.success !== false) {
        setTimeout(() => {
          navigate(ROUTES.HOME, { replace: true });
        }, 1500);
      }
    } catch (error) {
      console.error('프로필 등록 실패:', error);
      showToast(ERROR_MESSAGES.SAVE_FAILED, 'error');
    }
  };

  const isFormValid = (): boolean => {
    return (
      formData.address.trim() !== '' && formData.detailAddress.trim() !== ''
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header
        variant="sub"
        title="프로필 등록"
        showMenu={false}
        hideBackButton={true}
      />

      <div className="px-4 py-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* 프로필 이미지 */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {imagePreview || formData.profileImage ? (
                  <img
                    src={imagePreview || formData.profileImage}
                    alt="프로필"
                    className="w-full h-full object-cover"
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
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                placeholder="서울특별시 서초구"
                className={`w-full p-3 border focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg transition-colors ${
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
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    detailAddress: e.target.value,
                  }))
                }
                placeholder="상세 주소를 입력해주세요"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
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
                  {uploadingImage ? '이미지 업로드 중...' : '등록 중...'}
                </div>
              ) : (
                '등록하기'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumerProfileSetup;
