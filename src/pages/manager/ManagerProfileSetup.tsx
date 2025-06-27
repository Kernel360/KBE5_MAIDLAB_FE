import React, { useState } from 'react';
import { Plus, X, Clock, FileText, User, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  SERVICE_LIST,
  SEOUL_DISTRICT_LABELS,
  WEEKDAYS,
  WEEKDAY_LABELS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  BUTTON_TEXTS,
  LENGTH_LIMITS,
  ROUTES,
} from '@/constants';
import { useToast, useManager } from '@/hooks';
import { validateDocumentFile } from '@/utils';
import { uploadToS3 } from '@/utils/s3';
import type {
  ManagerProfileCreateRequest,
  ServiceListItem,
  RegionListItem,
  ScheduleListItem,
  DocumentListItem,
  ManagerProfileFormData,
  ManagerProfileErrors,
  Document,
} from '@/types/manager';
import type { TimeSlot } from '@/types/common';

const ManagerProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const { showToast } = useToast();
  const { createProfile, loading } = useManager();
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState<ManagerProfileFormData>({
    profileImage: undefined,
    serviceTypes: [],
    regions: [],
    availableTimes: [],
    introduceText: '',
    documents: [],
  });
  const [errors, setErrors] = useState<ManagerProfileErrors>({});

  // 서울 25개 구
  const regionOptions = [
    SEOUL_DISTRICT_LABELS.GANGNAM,
    SEOUL_DISTRICT_LABELS.GANGDONG,
    SEOUL_DISTRICT_LABELS.GANGBUK,
    SEOUL_DISTRICT_LABELS.GANGSEO,
    SEOUL_DISTRICT_LABELS.GWANAK,
    SEOUL_DISTRICT_LABELS.GWANGJIN,
    SEOUL_DISTRICT_LABELS.GURO,
    SEOUL_DISTRICT_LABELS.GEUMCHEON,
    SEOUL_DISTRICT_LABELS.NOWON,
    SEOUL_DISTRICT_LABELS.DOBONG,
    SEOUL_DISTRICT_LABELS.DONGDAEMUN,
    SEOUL_DISTRICT_LABELS.DONGJAK,
    SEOUL_DISTRICT_LABELS.MAPO,
    SEOUL_DISTRICT_LABELS.SEODAEMUN,
    SEOUL_DISTRICT_LABELS.SEOCHO,
    SEOUL_DISTRICT_LABELS.SEONGDONG,
    SEOUL_DISTRICT_LABELS.SEONGBUK,
    SEOUL_DISTRICT_LABELS.SONGPA,
    SEOUL_DISTRICT_LABELS.YANGCHEON,
    SEOUL_DISTRICT_LABELS.YEONGDEUNGPO,
    SEOUL_DISTRICT_LABELS.YONGSAN,
    SEOUL_DISTRICT_LABELS.EUNPYEONG,
    SEOUL_DISTRICT_LABELS.JONGNO,
    SEOUL_DISTRICT_LABELS.JUNG,
    SEOUL_DISTRICT_LABELS.JUNGNANG,
  ];

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

  const weekdays = Object.entries(WEEKDAY_LABELS).map(([key, label]) => ({
    id: key,
    label,
  }));

  const documentTypes = [
    { id: 'ID_CARD', label: '신분증 사본' },
    { id: 'CAREER_CERTIFICATE', label: '경력 증명서' },
    { id: 'LICENSE', label: '자격증 사본' },
  ];

  // 프로필 이미지 업로드
  const handleProfileImageUpload = async () => {
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

  const handleServiceToggle = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(serviceId)
        ? prev.serviceTypes.filter((id) => id !== serviceId)
        : [...prev.serviceTypes, serviceId],
    }));

    if (errors.serviceTypes) {
      setErrors((prev) => ({ ...prev, serviceTypes: undefined }));
    }
  };

  const handleRegionToggle = (region: string) => {
    setFormData((prev) => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter((r) => r !== region)
        : [...prev.regions, region],
    }));

    if (errors.regions) {
      setErrors((prev) => ({ ...prev, regions: undefined }));
    }
  };

  // 가능 시간 중복 체크 함수 (시간 구간 겹침 포함)
  const hasDuplicateTimeSlot = (slots: typeof formData.availableTimes) => {
    // 요일별로 구간을 모아서 겹치는지 확인
    const byDay: Record<string, { start: number; end: number }[]> = {};
    for (const slot of slots) {
      if (!byDay[slot.day]) byDay[slot.day] = [];
      const start = Number(slot.startTime.replace(':', ''));
      const end = Number(slot.endTime.replace(':', ''));
      // 겹치는 구간이 있는지 확인
      for (const range of byDay[slot.day]) {
        if (start < range.end && end > range.start) {
          return true;
        }
      }
      byDay[slot.day].push({ start, end });
    }
    return false;
  };

  const addTimeSlot = () => {
    setFormData((prev) => ({
      ...prev,
      availableTimes: [
        ...prev.availableTimes,
        {
          day: WEEKDAYS.MONDAY,
          startTime: '09:00',
          endTime: '17:00',
        },
      ],
    }));
  };

  const updateTimeSlot = (
    index: number,
    field: keyof TimeSlot,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      availableTimes: prev.availableTimes.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot,
      ),
    }));
  };

  const removeTimeSlot = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      availableTimes: prev.availableTimes.filter((_, i) => i !== index),
    }));
  };

  const handleDocumentUpload = async (type: string) => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx';
      input.multiple = false;

      input.onchange = async (e) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        const validation = validateDocumentFile(file);
        if (!validation.isValid) {
          showToast(
            validation.error || ERROR_MESSAGES.FILE_UPLOAD_FAILED,
            'error',
          );
          return;
        }

        const isDuplicate = formData.documents.some(
          (doc) => doc.fileType === type,
        );
        if (isDuplicate) {
          showToast('이미 업로드된 서류입니다.', 'error');
          return;
        }

        setUploadingDocument(true);
        try {
          // S3에 문서 업로드
          const { url } = await uploadToS3(file);

          const newDoc: Document = {
            fileType: type,
            fileName: file.name,
            uploadedFileUrl: url,
          };

          setFormData((prev) => ({
            ...prev,
            documents: [...prev.documents, newDoc],
          }));

          showToast('서류가 업로드되었습니다.', 'success');
        } catch (error) {
          showToast('서류 업로드에 실패했습니다.', 'error');
        } finally {
          setUploadingDocument(false);
        }
      };

      input.click();
    } catch (error) {
      showToast(ERROR_MESSAGES.FILE_UPLOAD_FAILED, 'error');
    }
  };

  const removeDocument = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
    showToast('서류가 제거되었습니다.', 'info');
  };

  const validateStep = (step: number): boolean => {
    const newErrors: ManagerProfileErrors = {};

    switch (step) {
      case 1:
        if (formData.serviceTypes.length === 0) {
          newErrors.serviceTypes = '하나 이상의 서비스를 선택해주세요.';
        }
        break;
      case 2:
        if (formData.regions.length === 0) {
          newErrors.regions = '하나 이상의 지역을 선택해주세요.';
        }
        break;
      case 3: {
        if (formData.availableTimes.length === 0) {
          newErrors.availableTimes = '하나 이상의 가능 시간을 등록해주세요.';
        }
        // 각 구간이 1시간 이상 차이나는지 확인
        for (const slot of formData.availableTimes) {
          const start = Number(slot.startTime.replace(':', ''));
          const end = Number(slot.endTime.replace(':', ''));
          if (end - start < 100) {
            showToast(
              '시작시간과 종료시간은 최소 1시간 이상 차이나야 합니다.',
              'error',
            );
            setErrors(newErrors);
            return false;
          }
        }
        if (hasDuplicateTimeSlot(formData.availableTimes)) {
          showToast('중복된 가능 시간이 있습니다.', 'error');
          setErrors(newErrors);
          return false;
        }
        if (
          formData.introduceText &&
          formData.introduceText.length > LENGTH_LIMITS.INTRODUCE.MAX
        ) {
          newErrors.introduceText = `소개글은 ${LENGTH_LIMITS.INTRODUCE.MAX}자 이하로 입력해주세요.`;
        }
        break;
      }
      case 4:
        if (formData.documents.length < 3) {
          newErrors.documents = '필수 서류 3개를 모두 업로드해주세요.';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep((prev) => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const profileData: ManagerProfileCreateRequest = {
        profileImage: formData.profileImage,
        serviceTypes: formData.serviceTypes.map(
          (type): ServiceListItem => ({
            serviceType: type,
          }),
        ),
        regions: formData.regions.map(
          (region): RegionListItem => ({
            region,
          }),
        ),
        availableTimes: formData.availableTimes.map(
          (time): ScheduleListItem => ({
            day: time.day,
            startTime: time.startTime,
            endTime: time.endTime,
          }),
        ),
        introduceText: formData.introduceText || '',
        documents: formData.documents.map(
          (doc): DocumentListItem => ({
            fileType: doc.fileType,
            fileName: doc.fileName,
            uploadedFileUrl: doc.uploadedFileUrl,
          }),
        ),
      };

      const result = await createProfile(profileData);

      if (result.success) {
        setTimeout(() => {
          navigate(ROUTES.HOME, { replace: true });
        }, 1500);
      }
    } catch (error) {
      console.error('프로필 등록 실패:', error);
      showToast(ERROR_MESSAGES.SAVE_FAILED, 'error');
    }
  };

  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 1:
        return formData.serviceTypes.length > 0 && !!formData.profileImage;
      case 2:
        return formData.regions.length > 0;
      case 3:
        return formData.availableTimes.length > 0;
      case 4:
        return formData.documents.length >= 3;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* 프로필 이미지 업로드 */}
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {imagePreview || formData.profileImage ? (
                    <img
                      src={imagePreview || formData.profileImage}
                      alt="프로필"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <button
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

            {/* 서비스 선택 */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                제공 가능한 서비스
              </h2>
              <p className="text-gray-600">어떤 서비스를 제공하실 수 있나요?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {SERVICE_LIST.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceToggle(service.id)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    formData.serviceTypes.includes(service.id)
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{service.icon}</div>
                  <div className="font-medium">{service.label}</div>
                </button>
              ))}
            </div>

            {errors.serviceTypes && (
              <p className="text-red-500 text-sm mt-2">{errors.serviceTypes}</p>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                가능 지역
              </h2>
              <p className="text-gray-600">
                어느 지역에서 서비스 가능하신가요?
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {regionOptions.map((region) => (
                <button
                  key={region}
                  onClick={() => handleRegionToggle(region)}
                  className={`p-2 text-sm rounded-lg border transition-all ${
                    formData.regions.includes(region)
                      ? 'border-orange-500 bg-orange-50 text-orange-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>

            {formData.regions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.regions.map((region) => (
                  <span
                    key={region}
                    className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm"
                  >
                    {region}
                  </span>
                ))}
              </div>
            )}

            {errors.regions && (
              <p className="text-red-500 text-sm mt-2">{errors.regions}</p>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                가능 시간
              </h2>
              <p className="text-gray-600">언제 서비스 제공이 가능하신가요?</p>
            </div>

            <div className="space-y-4">
              {formData.availableTimes.map((slot, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                >
                  <select
                    value={slot.day}
                    onChange={(e) =>
                      updateTimeSlot(index, 'day', e.target.value)
                    }
                    className="flex-1 p-2 border border-gray-300 rounded"
                  >
                    {weekdays.map((day) => (
                      <option key={day.id} value={day.id}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={slot.startTime}
                    onChange={(e) =>
                      updateTimeSlot(index, 'startTime', e.target.value)
                    }
                    className="flex-1 p-2 border border-gray-300 rounded"
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
                      updateTimeSlot(index, 'endTime', e.target.value)
                    }
                    className="flex-1 p-2 border border-gray-300 rounded"
                  >
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeTimeSlot(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addTimeSlot}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-orange-500 hover:text-orange-500 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              시간 추가
            </button>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Clock className="w-4 h-4" />
                <span>소개글 (선택사항)</span>
              </div>
              <textarea
                value={formData.introduceText}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    introduceText: e.target.value,
                  }))
                }
                placeholder="고객에게 보여질 간단한 소개를 작성해주세요."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                rows={3}
                maxLength={LENGTH_LIMITS.INTRODUCE.MAX}
              />
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span>고객에게 보여질 간단한 소개를 작성해주세요.</span>
                <span>
                  {formData.introduceText.length}/{LENGTH_LIMITS.INTRODUCE.MAX}
                </span>
              </div>
            </div>

            {errors.availableTimes && (
              <p className="text-red-500 text-sm mt-2">
                {errors.availableTimes}
              </p>
            )}
            {errors.introduceText && (
              <p className="text-red-500 text-sm mt-2">
                {errors.introduceText}
              </p>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                필수 서류 업로드
              </h2>
              <p className="text-gray-600">
                서비스 제공을 위한 필수 서류를 업로드해주세요
              </p>
            </div>

            <div className="space-y-4">
              {documentTypes.map((docType) => {
                const uploaded = formData.documents.find(
                  (doc) => doc.fileType === docType.id,
                );
                return (
                  <div
                    key={docType.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium">{docType.label}</div>
                        {uploaded && (
                          <div className="text-sm text-gray-500">
                            {uploaded.fileName}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        uploaded
                          ? removeDocument(formData.documents.indexOf(uploaded))
                          : handleDocumentUpload(docType.id)
                      }
                      disabled={loading || uploadingDocument}
                      className={`p-2 rounded-full transition-colors ${
                        uploaded
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                      } ${loading || uploadingDocument ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {loading || uploadingDocument ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : uploaded ? (
                        <X className="w-5 h-5" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">i</span>
                </div>
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">업로드 안내</p>
                  <ul className="space-y-1 text-xs">
                    <li>• PDF, DOC, DOCX 파일만 업로드 가능합니다.</li>
                    <li>• 파일 크기는 10MB 이하로 제한됩니다.</li>
                    <li>• 개인정보는 안전하게 보호됩니다.</li>
                  </ul>
                </div>
              </div>
            </div>

            {errors.documents && (
              <p className="text-red-500 text-sm mt-2">{errors.documents}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-center p-4 border-b">
        <h1 className="text-lg font-bold">프로필 등록</h1>
      </div>

      {/* Progress */}
      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step <= currentStep
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-16 h-0.5 mx-2 transition-colors ${
                      step < currentStep ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="mb-6">{renderStep()}</div>

          {/* Actions */}
          <div className="space-y-3">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="w-full py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {BUTTON_TEXTS.PREVIOUS}
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={
                !isStepValid() || loading || uploadingDocument || uploadingImage
              }
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                isStepValid() &&
                !loading &&
                !uploadingDocument &&
                !uploadingImage
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading || uploadingDocument || uploadingImage ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {uploadingImage
                    ? '이미지 업로드 중...'
                    : uploadingDocument
                      ? '파일 업로드 중...'
                      : '처리 중...'}
                </div>
              ) : currentStep === 4 ? (
                '등록하기'
              ) : (
                BUTTON_TEXTS.NEXT
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerProfileSetup;
