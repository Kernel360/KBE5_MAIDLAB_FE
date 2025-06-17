import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, User, Eye, EyeOff, Lock } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useConsumer } from '@/hooks/useConsumer';
import { useAuth } from '@/hooks/useAuth';
import type { ConsumerProfileRequestDto } from '@/apis/consumer';
import { ROUTES } from '@/constants';
import { uploadToS3 } from '@/utils/s3';
import { validatePassword } from '@/utils/validation';

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

const ProfileEdit: React.FC = () => {
  const { profile, fetchProfile, updateProfile, loading } = useConsumer();
  const { changePassword } = useAuth();
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
  
  // 비밀번호 변경 모달 상태
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false
  });
  const [passwordErrors, setPasswordErrors] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  
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
    
    // 에러 메시지 초기화
    if (field === 'address' && errors.address) {
      setErrors(prev => ({ ...prev, address: '' }));
    }
    if (field === 'detailAddress' && errors.detailAddress) {
      setErrors(prev => ({ ...prev, detailAddress: '' }));
    }
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
    return !errors.address && !errors.detailAddress && formData.address.trim() !== '' && formData.detailAddress.trim() !== '';
  };

  // 비밀번호 변경 핸들러들
  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 메시지 초기화
    if (field === 'newPassword' && passwordErrors.newPassword) {
      setPasswordErrors(prev => ({ ...prev, newPassword: '' }));
    }
    if (field === 'confirmPassword' && passwordErrors.confirmPassword) {
      setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  };

  const validatePasswordForm = (): boolean => {
    const newErrors = { newPassword: '', confirmPassword: '' };
    
    if (!passwordData.newPassword.trim()) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요.';
    } else if (!validatePassword(passwordData.newPassword)) {
      newErrors.newPassword = '영문과 숫자를 포함하여 8-20자로 입력해주세요.';
    }
    
    if (!passwordData.confirmPassword.trim()) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    
    setPasswordErrors(newErrors);
    return !newErrors.newPassword && !newErrors.confirmPassword;
  };

  const handlePasswordSubmit = async () => {
    if (!validatePasswordForm()) return;
    
    setChangingPassword(true);
    try {
      const result = await changePassword(passwordData.newPassword);
      if (result.success) {
        setShowPasswordModal(false);
        setPasswordData({
          newPassword: '',
          confirmPassword: '',
          showPassword: false,
          showConfirmPassword: false
        });
        setPasswordErrors({ newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    const newErrors = { address: '', detailAddress: '' };
    if (!formData.address.trim()) {
      newErrors.address = '주소를 입력해주세요.';
    }
    if (!formData.detailAddress.trim()) {
      newErrors.detailAddress = '상세 주소를 입력해주세요.';
    }
    
    if (newErrors.address || newErrors.detailAddress) {
      setErrors(newErrors);
      return;
    }

    try {
      const profileData: ConsumerProfileRequestDto = {
        profileImage: formData.profileImage,
        address: formData.address,
        detailAddress: formData.detailAddress
      };

      await updateProfile(profileData);
      navigate(ROUTES.CONSUMER.MYPAGE);
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
          onClick={() => navigate(ROUTES.CONSUMER.PROFILE)}
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

          {/* 프로필 정보 */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 text-center">
              프로필 정보
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

              {/* 비밀번호 재설정 버튼 */}
              <div className="pt-2">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="text-sm text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1"
                >
                  <Lock className="w-4 h-4" />
                  비밀번호 재설정
                </button>
              </div>
            </div>
          </div>

          {/* 버튼 그룹 */}
          <div className="pt-6 space-y-3">
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

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">비밀번호 재설정</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  새 비밀번호
                </label>
                <div className="relative">
                  <input
                    type={passwordData.showPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    placeholder="새 비밀번호를 입력하세요"
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    {passwordData.showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  새 비밀번호 확인
                </label>
                <div className="relative">
                  <input
                    type={passwordData.showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    placeholder="새 비밀번호를 다시 입력하세요"
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordData(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    {passwordData.showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handlePasswordSubmit}
                disabled={changingPassword}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  changingPassword
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {changingPassword ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    변경 중...
                  </div>
                ) : (
                  '변경하기'
                )}
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                disabled={changingPassword}
                className="flex-1 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileEdit;