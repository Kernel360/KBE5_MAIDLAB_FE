import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Upload, Plus, X, Clock } from 'lucide-react';
import { useManager, useToast } from '@/hooks';
import { LoadingSpinner } from '@/components/common';
import {
  SERVICE_TYPES,
  SERVICE_TYPE_LABELS,
  WEEKDAY_LABELS,
  WEEKDAYS,
} from '@/constants/service';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/constants/message';
import { SEOUL_DISTRICT_LABELS } from '@/constants/region';
import { GENDER_LABELS, GENDER } from '@/constants/user';
import { ROUTES } from '@/constants/route';
import { LENGTH_LIMITS } from '@/constants/validation';
import type {
  ManagerProfileResponse,
  ManagerProfileUpdateRequest,
} from '@/types/manager';
import type { ServiceType } from '@/constants/service';
import type { SeoulDistrict } from '@/constants/region';
import { uploadToS3 } from '@/utils/s3';
import { validateImageFile } from '@/utils/validation';

const ManagerProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const { fetchProfile, updateProfile, loading } = useManager();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<ManagerProfileResponse | null>(null);
  const [errors, setErrors] = useState({ name: '', gender: '', birth: '' });
  const [isValid, setIsValid] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  // profile 상태가 바뀔 때마다 추적
  useEffect(() => {
    console.log('profile 상태 변경:', profile);
  }, [profile]);

  const timeSlots = [
    '06:00',
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
  ];

  useEffect(() => {
    (async () => {
      const data = await fetchProfile();
      console.log('fetchProfile로 받아온 데이터:', data);
      setProfile((prev) => {
        if (prev && prev.profileImage && data) {
          if (prev.profileImage !== data.profileImage) {
            // data의 모든 필드를 유지하되, profileImage만 prev.profileImage로 덮어씀
            return { ...data, profileImage: prev.profileImage };
          }
        }
        return data ?? null;
      });
    })();
  }, [fetchProfile]);

  // 생년월일 자동 하이픈 처리
  const handleBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    if (value.length > 4) value = value.slice(0, 4) + '-' + value.slice(4);
    if (value.length > 7) value = value.slice(0, 7) + '-' + value.slice(7);
    setProfile((prev) => (prev ? { ...prev, birth: value } : prev));
  };

  // 날짜 유효성 검사 함수 (YYYY-MM-DD)
  function isValidDate(str: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
    const [year, month, day] = str.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  const validate = () => {
    const newErrors = { name: '', gender: '', birth: '' };
    if (!profile?.name || profile.name.trim() === '') {
      newErrors.name = '이름을 입력해주세요.';
    }
    if (!profile?.gender) {
      newErrors.gender = '성별을 선택해주세요.';
    }
    if (!profile?.birth || profile.birth.trim() === '') {
      newErrors.birth = '생년월일을 입력해주세요.';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(profile.birth)) {
      newErrors.birth = '생년월일 8자리를 입력해주세요.';
    } else if (!isValidDate(profile.birth)) {
      newErrors.birth = '올바른 생년월일이 아닙니다.';
    }
    setErrors(newErrors);
    return Object.values(newErrors).every((v) => v === '');
  };

  useEffect(() => {
    setIsValid(validate());
  }, [profile?.name, profile?.gender, profile?.birth]);

  const handleSubmit = async () => {
    if (!profile) return;

    console.log(profile.profileImage);

    try {
      const profileData: ManagerProfileUpdateRequest = {
        name: profile.name,
        birth: profile.birth,
        gender: profile.gender,
        profileImage: profile.profileImage,
        serviceTypes: profile.services.map((type) => ({ serviceType: type })),
        regions: profile.regions,
        availableTimes: profile.schedules,
        introduceText: profile.introduceText || '',
      };

      const result = await updateProfile(profileData);

      if (result.success) {
        showToast(SUCCESS_MESSAGES.PROFILE_UPDATED, 'success');
        navigate(ROUTES.MANAGER.PROFILE);
      }
    } catch (error) {
      console.error('프로필 수정 실패:', error);
      showToast(ERROR_MESSAGES.SAVE_FAILED, 'error');
    }
  };

  const handleServiceToggle = (service: string) => {
    if (!profile) return;

    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        services: prev.services.includes(service)
          ? prev.services.filter((s) => s !== service)
          : [...prev.services, service],
      };
    });
  };

  const handleRegionToggle = (region: string) => {
    if (!profile) return;

    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        regions: prev.regions.some((r) => r.region === region)
          ? prev.regions.filter((r) => r.region !== region)
          : [...prev.regions, { region }],
      };
    });
  };

  const addTimeSlot = () => {
    if (!profile) return;

    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        schedules: [
          ...prev.schedules,
          {
            day: WEEKDAYS.MONDAY,
            startTime: '09:00',
            endTime: '17:00',
          },
        ],
      };
    });
  };

  const updateTimeSlot = (index: number, field: string, value: string) => {
    if (!profile) return;

    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        schedules: prev.schedules.map((slot, i) =>
          i === index ? { ...slot, [field]: value } : slot,
        ),
      };
    });
  };

  const removeTimeSlot = (index: number) => {
    if (!profile) return;

    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        schedules: prev.schedules.filter((_, i) => i !== index),
      };
    });
  };

  // 프로필 이미지 업로드
  const handleProfileImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      // 이미지 타입/크기 검증
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        showToast(validation.error || '이미지 업로드 오류', 'error');
        return;
      }

      setUploadingImage(true);
      try {
        // 미리보기
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);

        // S3 업로드
        const { url } = await uploadToS3(file);
        setProfile((prev) => {
          const next = prev ? { ...prev, profileImage: url } : prev;
          console.log('setProfile(이미지 업로드) 직후 next:', next);
          return next;
        });
        showToast('프로필 이미지가 업로드되었습니다.', 'success');
      } catch (error) {
        showToast('이미지 업로드에 실패했습니다.', 'error');
        setImagePreview('');
      } finally {
        setUploadingImage(false);
      }
    };
    input.click();
  };

  if (loading || !profile) {
    return <LoadingSpinner message="프로필을 불러오는 중..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <button
          onClick={() => navigate(ROUTES.MANAGER.PROFILE)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">프로필 수정</h1>
        <div className="w-10" />
      </div>

      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-8">
            {/* 프로필 이미지 */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative mb-2">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {imagePreview || profile.profileImage ? (
                    <img
                      src={imagePreview || profile.profileImage}
                      alt="프로필"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleProfileImageUpload}
                  disabled={uploadingImage}
                  className={`absolute -bottom-1 -right-1 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg transition-colors ${
                    uploadingImage
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-orange-600'
                  }`}
                >
                  {uploadingImage ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                </button>
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
                onChange={(e) =>
                  setProfile((prev) =>
                    prev ? { ...prev, name: e.target.value } : prev,
                  )
                }
                className="w-full p-3 border text-center border-gray-300 rounded-lg text-gray-900"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* 성별 */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                성별
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setProfile((prev) =>
                      prev ? { ...prev, gender: GENDER.MALE } : prev,
                    )
                  }
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
                  onClick={() =>
                    setProfile((prev) =>
                      prev ? { ...prev, gender: GENDER.FEMALE } : prev,
                    )
                  }
                  className={`flex-1 py-2 rounded-lg border text-center font-medium transition-all ${
                    profile.gender === GENDER.FEMALE
                      ? 'border-orange-500 bg-orange-50 text-orange-600'
                      : 'border-gray-200 text-gray-400'
                  }`}
                >
                  {GENDER_LABELS[GENDER.FEMALE]}
                </button>
              </div>
              {errors.gender && (
                <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
              )}
            </div>

            {/* 생년월일 */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                생년월일
              </label>
              <input
                type="text"
                value={profile.birth}
                onChange={handleBirthChange}
                className="w-full p-3 border text-center border-gray-300 rounded-lg text-gray-900"
                placeholder="YYYY-MM-DD"
                maxLength={10}
                inputMode="numeric"
                autoComplete="bday"
              />
              {errors.birth && (
                <p className="text-red-500 text-sm mt-1">{errors.birth}</p>
              )}
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
                    onClick={() => handleServiceToggle(service)}
                    className={`w-full h-12 flex items-center justify-center rounded-lg border font-medium text-sm transition-all ${
                      profile.services.includes(service)
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-200 hover:border-gray-300 text-gray-400'
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
              <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto mb-4">
                {Object.values(SEOUL_DISTRICT_LABELS).map((region) => (
                  <button
                    key={region}
                    type="button"
                    onClick={() => handleRegionToggle(region)}
                    className={`p-2 text-sm rounded-lg border transition-all ${
                      profile.regions.some((r) => r.region === region)
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-200 hover:border-gray-300 text-gray-400'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                {profile.regions.map((region) => (
                  <span
                    key={region.region}
                    className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm"
                  >
                    {SEOUL_DISTRICT_LABELS[region.region as SeoulDistrict] ||
                      region.region}
                  </span>
                ))}
              </div>
            </div>

            {/* 가능 시간 */}
            <div className="mt-8 mb-6">
              <label className="block text-gray-700 font-medium mb-1">
                가능 시간
              </label>
              <div className="space-y-4">
                {profile.schedules.map((slot, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={slot.day}
                      onChange={(e) =>
                        updateTimeSlot(idx, 'day', e.target.value)
                      }
                      className="flex-1 p-2 border text-center border-gray-300 rounded"
                    >
                      {Object.entries(WEEKDAY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={slot.startTime}
                      onChange={(e) =>
                        updateTimeSlot(idx, 'startTime', e.target.value)
                      }
                      className="flex-1 p-2 border text-center border-gray-300 rounded"
                    >
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    <span className="text-gray-500">~</span>
                    <select
                      value={slot.endTime}
                      onChange={(e) =>
                        updateTimeSlot(idx, 'endTime', e.target.value)
                      }
                      className="flex-1 p-2 border text-center border-gray-300 rounded"
                    >
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeTimeSlot(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addTimeSlot}
                className="w-full mt-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-orange-500 hover:text-orange-500 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                시간 추가
              </button>
            </div>

            {/* 소개글 */}
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Clock className="w-4 h-4" />
                <label className="font-medium">소개글 (선택사항)</label>
              </div>
              <textarea
                value={profile.introduceText || ''}
                onChange={(e) =>
                  setProfile((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      introduceText: e.target.value,
                    };
                  })
                }
                placeholder="고객에게 보여질 간단한 소개를 작성해주세요."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                rows={3}
                maxLength={LENGTH_LIMITS.INTRODUCE.MAX}
              />
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span>고객에게 보여질 간단한 소개를 작성해주세요.</span>
                <span>
                  {(profile.introduceText || '').length}/
                  {LENGTH_LIMITS.INTRODUCE.MAX}
                </span>
              </div>
            </div>

            {/* 저장하기 버튼 */}
            <button
              onClick={handleSubmit}
              disabled={!isValid || loading || uploadingImage}
              className={`w-full mt-8 p-3 rounded-lg font-medium transition-colors ${
                !isValid || loading || uploadingImage
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              저장하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerProfileEdit;
