import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import { useConsumer } from '@/hooks/domain/useConsumer';
import { ROUTES } from '@/constants';

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
  const { profile, fetchProfile, loading } = useConsumer();
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    phoneNumber: '',
    birth: '',
    gender: 'MALE',
    address: '',
    detailAddress: '',
    profileImage: undefined
  });
  const [imageError, setImageError] = useState(false);
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
  }, [formData.profileImage]);

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
        <h1 className="text-lg font-bold">프로필 </h1>
        <div className="w-10" />
      </div>

      <div className="px-4 py-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* 프로필 이미지 */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {formData.profileImage ? (
                  <img
                    src={imageError ? DEFAULT_PROFILE_IMAGE : formData.profileImage}
                    alt="프로필"
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              프로필 사진
            </p>
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
                  disabled
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상세 주소 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.detailAddress}
                  disabled
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* 완료 버튼 */}
          <div className="pt-6">
            <button
              onClick={() => navigate(ROUTES.CONSUMER.PROFILE_EDIT)}
              className="w-full py-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              수정하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 