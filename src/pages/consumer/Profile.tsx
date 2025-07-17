import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useConsumer } from '@/hooks/domain/useConsumer';
import { ROUTES } from '@/constants';
import type { ProfileData } from '@/types/domain/consumer';
import { Header } from '@/components/layout/Header/Header';

const DEFAULT_PROFILE_IMAGE = '/default-profile.png';

const Profile: React.FC = () => {
  const { profile, fetchProfile, loading } = useConsumer();
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    birth: '',
    gender: 'MALE',
    address: '',
    detailAddress: '',
    profileImage: undefined,
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
        birth: profile.birth || '',
        gender: profile.gender || 'MALE',
        address: profile.address || '',
        detailAddress: profile.detailAddress || '',
        profileImage: profile.profileImage,
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
    <div className="min-h-screen bg-gray-50">
      <Header
        variant="sub"
        title="프로필"
        backRoute={ROUTES.CONSUMER.MYPAGE}
        showMenu={true}
      />

      <main className="px-4 py-6 pb-20">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-8">
            {/* 프로필 이미지 */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative mb-2">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {formData.profileImage ? (
                    <img
                      src={
                        imageError
                          ? DEFAULT_PROFILE_IMAGE
                          : formData.profileImage
                      }
                      alt="프로필"
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {/* 이름 */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                이름
              </label>
              <input
                type="text"
                value={formData.name}
                disabled
                className="w-full p-3 text-center rounded-lg text-gray-900 bg-gray-50 disabled:bg-gray-50"
              />
            </div>

            {/* 성별 */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                성별
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled
                  className={`flex-1 py-2 rounded-lg text-center font-medium transition-all ${formData.gender === 'MALE' ? 'bg-gray-50 text-gray-900' : 'text-gray-400'}`}
                >
                  남성
                </button>
                <button
                  type="button"
                  disabled
                  className={`flex-1 py-2 rounded-lg text-center font-medium transition-all ${formData.gender === 'FEMALE' ? 'bg-gray-50 text-gray-900' : 'text-gray-400'}`}
                >
                  여성
                </button>
              </div>
            </div>

            {/* 생년월일 */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                생년월일
              </label>
              <input
                type="text"
                value={formData.birth}
                disabled
                className="w-full p-3 text-center rounded-lg text-gray-900 bg-gray-50 disabled:bg-gray-50"
              />
            </div>

            {/* 주소 */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                주소
              </label>
              <input
                type="text"
                value={formData.address}
                disabled
                className="w-full p-3 text-center rounded-lg text-gray-900 bg-gray-50 disabled:bg-gray-50"
              />
            </div>

            {/* 상세 주소 */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                상세 주소
              </label>
              <input
                type="text"
                value={formData.detailAddress}
                disabled
                className="w-full p-3 text-center rounded-lg text-gray-900 bg-gray-50 disabled:bg-gray-50"
              />
            </div>

            {/* 완료 버튼 */}
            <div className="pt-1">
              <button
                onClick={() => navigate(ROUTES.CONSUMER.PROFILE_EDIT)}
                className="w-full py-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                수정하기
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
