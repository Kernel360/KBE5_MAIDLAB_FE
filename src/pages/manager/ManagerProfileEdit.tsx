import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Upload, Plus, X, Clock } from 'lucide-react';
import { useManager, useToast } from '@/hooks';
import { LoadingSpinner } from '@/components/common';
import { Header } from '@/components/layout/Header/Header';
import RegionSelectionModal from '@/components/features/manager/RegionSelectionModal';
import ScheduleSelector from '@/components/features/manager/ScheduleSelector';
import { validateBirthDate } from '@/constants/validation';

import {
  SERVICE_TYPES,
  SERVICE_TYPE_LABELS,
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
import { uploadToS3 } from '@/utils/s3';
import { validateImageFile } from '@/utils/validation';

const ManagerProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const { fetchProfile, updateProfile, loading } = useManager();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<ManagerProfileResponse | null>(null);
  const [errors, setErrors] = useState({
    name: '',
    gender: '',
    birth: '',
    regions: '',
    schedules: '',
    services: '',
  });
  const [touched, setTouched] = useState({
    name: false,
    gender: false,
    birth: false,
    regions: false,
    schedules: false,
    services: false,
  });
  const [isValid, setIsValid] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);

  // profile 상태가 바뀔 때마다 추적
  useEffect(() => {}, [profile]);

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
      setProfile((prev) => {
        if (prev && prev.profileImage && data) {
          if (prev.profileImage !== data.profileImage) {
            return { ...data, profileImage: prev.profileImage };
          }
        }
        return data ?? null;
      });
    })();
  }, []);

  // 필드별 터치 설정 함수
  const setFieldTouched = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // 생년월일 자동 하이픈 처리
  const handleBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    if (value.length > 4) value = value.slice(0, 4) + '-' + value.slice(4);
    if (value.length > 7) value = value.slice(0, 7) + '-' + value.slice(7);
    setProfile((prev) => (prev ? { ...prev, birth: value } : prev));
  };


  const validate = () => {
    const newErrors = {
      name: '',
      gender: '',
      birth: '',
      regions: '',
      schedules: '',
      services: '',
    };

    // 이름 검증
    if (!profile?.name || profile.name.trim() === '') {
      newErrors.name = '이름을 입력해주세요.';
    } else if (profile.name.length < 2 || profile.name.length > 20) {
      newErrors.name = '이름은 2-20자로 입력해주세요.';
    }

    // 성별 검증
    if (!profile?.gender) {
      newErrors.gender = '성별을 선택해주세요.';
    }

    // 생년월일 검증
    if (!profile?.birth || profile.birth.trim() === '') {
      newErrors.birth = '생년월일을 입력해주세요.';
    } else {
      const birthValidation = validateBirthDate(profile.birth);
      if (!birthValidation.isValid) {
        newErrors.birth = birthValidation.error || '올바른 생년월일을 입력해주세요.';
      }
    }

    // 서비스 검증
    if (!profile?.services || profile.services.length === 0) {
      newErrors.services = '제공 가능한 서비스를 1개 이상 선택해주세요.';
    }

    // 지역 검증
    if (!profile?.regions || profile.regions.length === 0) {
      newErrors.regions = '가능 지역을 1개 이상 선택해주세요.';
    }

    // 스케줄 검증
    if (!profile?.schedules || profile.schedules.length === 0) {
      newErrors.schedules = '가능 시간을 1개 이상 등록해주세요.';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((v) => v === '');
  };

  useEffect(() => {
    setIsValid(validate());
  }, [
    profile?.name,
    profile?.gender,
    profile?.birth,
    profile?.services,
    profile?.regions,
    profile?.schedules,
  ]);

  // 시간 중복 체크 함수
  const hasDuplicateTimeSlot = (
    slots: { day: string; startTime: string; endTime: string }[] = [],
  ) => {
    const byDay: Record<string, { start: number; end: number }[]> = {};
    for (const slot of slots) {
      if (!byDay[slot.day]) byDay[slot.day] = [];
      const start = Number(slot.startTime.replace(':', ''));
      const end = Number(slot.endTime.replace(':', ''));
      for (const range of byDay[slot.day]) {
        if (start < range.end && end > range.start) {
          return true;
        }
      }
      byDay[slot.day].push({ start, end });
    }
    return false;
  };

  // 시간 슬롯 유효성 검사 함수
  const validateTimeSlots = () => {
    if (!profile) return true;
    for (const slot of profile.schedules) {
      const start = Number(slot.startTime.replace(':', ''));
      const end = Number(slot.endTime.replace(':', ''));
      if (end - start < 100) {
        showToast(
          '시작시간과 종료시간은 최소 1시간 이상 차이나야 합니다.',
          'error',
        );
        return false;
      }
    }
    if (hasDuplicateTimeSlot(profile.schedules)) {
      showToast('같은 요일에 겹치는 시간이 있습니다.', 'error');
      return false;
    }
    return true;
  };

  // 제출 함수
  const handleSubmit = async () => {
    if (!profile) return;

    setTouched({
      name: true,
      gender: true,
      birth: true,
      services: true,
      regions: true,
      schedules: true,
    });

    if (!validate() || !validateTimeSlots()) {
      return;
    }

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

  // 지역 관련 핸들러 함수들
  const handleRegionToggle = (region: string) => {
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

  const handleSelectAll = () => {
    const allRegions = Object.values(SEOUL_DISTRICT_LABELS).map((region) => ({
      region,
    }));
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        regions: allRegions,
      };
    });
  };

  const handleClearAll = () => {
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        regions: [],
      };
    });
  };

  const handleRemoveRegion = (region: string) => {
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        regions: prev.regions.filter((r) => r.region !== region),
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

    const updatedSchedules = profile.schedules.map((slot, i) =>
      i === index ? { ...slot, [field]: value } : slot,
    );
    const currentSlot = updatedSchedules[index];
    if (currentSlot.startTime && currentSlot.endTime) {
      const start = Number(currentSlot.startTime.replace(':', ''));
      const end = Number(currentSlot.endTime.replace(':', ''));
      if (end <= start) {
        showToast('종료시간은 시작시간보다 늦어야 합니다.', 'error');
      } else if (end - start < 100) {
        showToast(
          '시작시간과 종료시간은 최소 1시간 이상 차이나야 합니다.',
          'error',
        );
      }
    }
  };

  const addTimeSlot = () => {
    if (!profile) return;
    const newSlot = {
      day: WEEKDAYS.MONDAY,
      startTime: '09:00',
      endTime: '17:00',
    };
    const updatedSchedules = [...profile.schedules, newSlot];
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        schedules: updatedSchedules,
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

      const validation = validateImageFile(file);
      if (!validation.isValid) {
        showToast(validation.error || '이미지 업로드 오류', 'error');
        return;
      }

      setUploadingImage(true);
      try {
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);

        const { url } = await uploadToS3(file);
        setProfile((prev) => {
          const next = prev ? { ...prev, profileImage: url } : prev;
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
      <Header
        variant="sub"
        title="프로필 수정"
        backRoute={ROUTES.MANAGER.PROFILE}
        showMenu={true}
      />

      <div className="px-4 py-6 pt-20">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                onBlur={() => setFieldTouched('name')}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all text-center ${
                  errors.name && touched.name
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {errors.name && touched.name && (
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
                  onClick={() => {
                    setProfile((prev) =>
                      prev ? { ...prev, gender: GENDER.MALE } : prev,
                    );
                    setFieldTouched('gender');
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg border text-center font-medium transition-all ${
                    profile.gender === GENDER.MALE
                      ? 'border-orange-500 bg-orange-50 text-orange-600'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {GENDER_LABELS[GENDER.MALE]}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfile((prev) =>
                      prev ? { ...prev, gender: GENDER.FEMALE } : prev,
                    );
                    setFieldTouched('gender');
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg border text-center font-medium transition-all ${
                    profile.gender === GENDER.FEMALE
                      ? 'border-orange-500 bg-orange-50 text-orange-600'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {GENDER_LABELS[GENDER.FEMALE]}
                </button>
              </div>
              {errors.gender && touched.gender && (
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
                value={profile.birth}
                onChange={handleBirthChange}
                onBlur={() => setFieldTouched('birth')}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all text-center ${
                  errors.birth && touched.birth
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                placeholder="1990-01-01"
                maxLength={10}
                inputMode="numeric"
                autoComplete="bday"
              />
              {errors.birth && touched.birth && (
                <p className="text-red-500 text-sm mt-1">{errors.birth}</p>
              )}
            </div>

            {/* 제공 서비스 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제공 가능한 서비스
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(SERVICE_TYPES).map((service) => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => {
                      handleServiceToggle(service);
                      setFieldTouched('services');
                    }}
                    className={`w-full h-12 flex items-center justify-center rounded-lg border font-medium text-sm transition-all ${
                      profile.services.includes(service)
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    {SERVICE_TYPE_LABELS[service as ServiceType]}
                  </button>
                ))}
              </div>
              {errors.services && touched.services && (
                <p className="text-red-500 text-sm mt-1">{errors.services}</p>
              )}
            </div>

            {/* 가능 지역 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                가능 지역
              </label>

              {/* 선택된 지역 표시 */}
              <div className="mb-3">
                {profile.regions.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {profile.regions.map((region) => (
                      <span
                        key={region.region}
                        className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm flex items-center gap-1"
                      >
                        {region.region}
                        <button
                          onClick={() => handleRemoveRegion(region.region)}
                          className="text-orange-400 hover:text-orange-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm py-2">
                    지역을 선택해주세요
                  </p>
                )}
                {errors.regions && touched.regions && (
                  <p className="text-red-500 text-sm mt-1">{errors.regions}</p>
                )}
              </div>

              {/* 지역 추가 버튼 */}
              <button
                type="button"
                onClick={() => {
                  setIsRegionModalOpen(true);
                  setFieldTouched('regions');
                }}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-orange-500 hover:text-orange-500 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                지역 추가 ({profile.regions.length}개 선택됨)
              </button>
            </div>

            {/* 가능 시간 - ScheduleSelector로 대체 */}
            <div className="mt-8 mb-6">
              <ScheduleSelector
                schedules={profile.schedules}
                onUpdateTimeSlot={updateTimeSlot}
                onAddTimeSlot={addTimeSlot}
                onRemoveTimeSlot={removeTimeSlot}
                error={errors.schedules}
                touched={touched.schedules}
                onTouch={() => setFieldTouched('schedules')}
                timeSlots={timeSlots}
              />
            </div>

            {/* 소개글 */}
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 resize-none transition-all"
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
              disabled={loading || uploadingImage}
              className={`w-full mt-8 py-3 px-4 rounded-lg font-medium transition-colors ${
                loading || uploadingImage
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  저장 중...
                </div>
              ) : (
                '저장하기'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 지역 선택 모달 */}
      <RegionSelectionModal
        isOpen={isRegionModalOpen}
        onClose={() => setIsRegionModalOpen(false)}
        selectedRegions={profile.regions}
        onRegionToggle={handleRegionToggle}
        onSelectAll={handleSelectAll}
        onClearAll={handleClearAll}
        title="가능 지역 선택"
        showSelectAllButtons={true}
      />
    </div>
  );
};

export default ManagerProfileEdit;
