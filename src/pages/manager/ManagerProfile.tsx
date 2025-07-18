import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useManager } from '@/hooks';
import { LoadingSpinner } from '@/components/common';
import { Header } from '@/components/layout/Header/Header';
import { SERVICE_TYPES, SERVICE_TYPE_LABELS } from '@/constants/service';
import { SEOUL_DISTRICT_LABELS } from '@/constants/region';
import { GENDER_LABELS, GENDER } from '@/constants/user';
import { ROUTES } from '@/constants/route';
import type { ManagerProfileResponse } from '@/types/domain/manager';
import type { ServiceType } from '@/constants/service';
import type { SeoulDistrict } from '@/constants/region';
import ScheduleSummary from '@/components/features/manager/ScheduleSummary';

const ManagerProfile: React.FC = () => {
  const navigate = useNavigate();
  const { fetchProfile, loading } = useManager();
  const [profile, setProfile] = useState<ManagerProfileResponse | null>(null);

  useEffect(() => {
    (async () => {
      const data = await fetchProfile();
      setProfile(data ?? null);
    })();
  }, []);

  if (loading || !profile) {
    return <LoadingSpinner message="프로필을 불러오는 중..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header
        variant="sub"
        title="프로필"
        backRoute={ROUTES.MANAGER.MYPAGE}
        showMenu={true}
      />

      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-8">
            {/* 프로필 이미지 */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative mb-2">
                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt="프로필"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            {/* 이름 */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                이름
              </label>
              <input
                type="text"
                value={profile.name}
                disabled
                className="w-full p-3 text-center text-sm rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-gray-700"
              />
            </div>

            {/* 성별 */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                성별
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled
                  className={`flex-1 py-2 rounded-lg text-center font-medium text-sm transition-all ${
                    profile.gender === GENDER.MALE
                      ? 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {GENDER_LABELS[GENDER.MALE]}
                </button>
                <button
                  type="button"
                  disabled
                  className={`flex-1 py-2 rounded-lg text-center font-medium text-sm transition-all ${
                    profile.gender === GENDER.FEMALE
                      ? 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {GENDER_LABELS[GENDER.FEMALE]}
                </button>
              </div>
            </div>

            {/* 생년월일 */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                생년월일
              </label>
              <input
                type="text"
                value={profile.birth}
                disabled
                className="w-full p-3 text-center rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-gray-700 text-sm"
              />
            </div>

            {/* 제공 서비스 */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                제공 가능한 서비스
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(SERVICE_TYPES).map((service) => (
                  <button
                    key={service}
                    type="button"
                    disabled
                    className={`w-full h-12 flex items-center justify-center rounded-lg  font-medium text-sm transition-all ${
                      profile.services.includes(service)
                        ? 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {SERVICE_TYPE_LABELS[service as ServiceType]}
                  </button>
                ))}
              </div>
            </div>

            {/* 가능 지역 */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                가능 지역
              </label>
              <div className="flex gap-2 flex-wrap">
                {profile.regions.map((region) => (
                  <button
                    key={region.region}
                    type="button"
                    disabled
                    className="px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium text-sm"
                  >
                    {SEOUL_DISTRICT_LABELS[region.region as SeoulDistrict] ||
                      region.region}
                  </button>
                ))}
              </div>
            </div>

            {/* 가능 시간 */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                가능 시간
              </label>
              <ScheduleSummary schedules={profile.schedules} />
            </div>
            {/* 소개글 */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                소개글
              </label>
              <textarea
                value={profile.introduceText || ''}
                disabled
                className="w-full p-3  text-center text-sm rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-gray-700 resize-none min-h-[48px]"
                rows={3}
              />
            </div>

            {/* 비상연락처 - 소셜 로그인 사용자만 표시 */}
            {profile.emergencyCall !== undefined && (
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  비상연락처
                </label>
                <input
                  type="text"
                  value={profile.emergencyCall || ''}
                  disabled
                  className="w-full p-3 text-center rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-gray-700 text-sm"
                />
              </div>
            )}

            {/* 수정하기 버튼 */}
            <button
              type="button"
              className="w-full py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors mt-4"
              onClick={() => navigate(ROUTES.MANAGER.PROFILE_EDIT)}
            >
              수정하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerProfile;
