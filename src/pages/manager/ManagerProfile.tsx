import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import { useManager } from '@/hooks';
import { LoadingSpinner } from '@/components/common';
import {
  SERVICE_TYPES,
  SERVICE_TYPE_LABELS,
  WEEKDAY_LABELS,
} from '@/constants/service';
import { SEOUL_DISTRICT_LABELS } from '@/constants/region';
import { GENDER_LABELS, GENDER } from '@/constants/user';
import { ROUTES } from '@/constants/route';
import type { ManagerProfileResponse } from '@/types/manager';
import type { ServiceType } from '@/constants/service';
import type { SeoulDistrict } from '@/constants/region';

const ManagerProfile: React.FC = () => {
  const navigate = useNavigate();
  const { fetchProfile, loading } = useManager();
  const [profile, setProfile] = useState<ManagerProfileResponse | null>(null);

  useEffect(() => {
    (async () => {
      const data = await fetchProfile();
      setProfile(data ?? null);
    })();
  }, [fetchProfile]);

  if (loading || !profile) {
    return <LoadingSpinner message="프로필을 불러오는 중..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">프로필</h1>
        <div className="w-10" />
      </div>

      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-8">
            {/* 프로필 이미지 */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative mb-2">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt="프로필"
                      className="w-full h-full object-cover"
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
                value={profile.name}
                disabled
                className="w-full p-3 border text-center border-gray-300 rounded-lg text-gray-900 bg-gray-50 disabled:bg-gray-50"
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
                  className={`flex-1 py-2 rounded-lg border text-center font-medium transition-all ${
                    profile.gender === GENDER.MALE
                      ? 'border-orange-500 bg-orange-50 text-orange-600'
                      : 'border-gray-200 text-gray-400'
                  }`}
                >
                  {GENDER_LABELS[GENDER.MALE]}
                </button>
                <button
                  type="button"
                  disabled
                  className={`flex-1 py-2 rounded-lg border text-center font-medium transition-all ${
                    profile.gender === GENDER.FEMALE
                      ? 'border-orange-500 bg-orange-50 text-orange-600'
                      : 'border-gray-200 text-gray-400'
                  }`}
                >
                  {GENDER_LABELS[GENDER.FEMALE]}
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
                value={profile.birth}
                disabled
                className="w-full p-3 border text-center border-gray-300 rounded-lg text-gray-900 bg-gray-50 disabled:bg-gray-50"
              />
            </div>

            {/* 제공 서비스 */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                제공 가능한 서비스
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(SERVICE_TYPES).map((service) => (
                  <button
                    key={service}
                    type="button"
                    disabled
                    className={`w-full h-12 flex items-center justify-center rounded-lg border font-medium text-sm transition-all ${
                      profile.services.includes(service)
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-200 text-gray-400'
                    }`}
                  >
                    {SERVICE_TYPE_LABELS[service as ServiceType]}
                  </button>
                ))}
              </div>
            </div>

            {/* 가능 지역 */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                가능 지역
              </label>
              <div className="flex gap-2 flex-wrap">
                {profile.regions.map((region) => (
                  <button
                    key={region.region}
                    type="button"
                    disabled
                    className="px-4 py-2 rounded-lg border border-orange-500 bg-orange-50 text-orange-600 font-medium text-sm"
                  >
                    {SEOUL_DISTRICT_LABELS[region.region as SeoulDistrict] ||
                      region.region}
                  </button>
                ))}
              </div>
            </div>

            {/* 가능 시간 */}
            <div className="mt-8 mb-6">
              <label className="block text-gray-700 font-medium mb-1">
                가능 시간
              </label>
              <div className="space-y-2">
                {profile.schedules.map((slot, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={slot.day}
                      disabled
                      className="w-28 p-2 border text-center border-gray-300 rounded text-gray-900 bg-gray-50 disabled:bg-gray-50 appearance-none"
                    >
                      {Object.entries(WEEKDAY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={slot.startTime}
                      disabled
                      className="w-24 p-2 border text-center border-gray-300 rounded text-gray-900 bg-gray-50 disabled:bg-gray-50"
                    />
                    <span className="mx-1">~</span>
                    <input
                      type="text"
                      value={slot.endTime}
                      disabled
                      className="w-24 p-2 border text-center border-gray-300 rounded text-gray-900 bg-gray-50 disabled:bg-gray-50"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 소개글 */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                소개글
              </label>
              <textarea
                value={profile.introduceText || ''}
                disabled
                className="w-full p-3 border text-center border-gray-300 rounded-lg text-gray-900 bg-gray-50 disabled:bg-gray-50 resize-none min-h-[48px]"
                rows={3}
              />
            </div>

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
