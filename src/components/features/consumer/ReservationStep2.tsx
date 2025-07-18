// src/components/features/consumer/ReservationStep2.tsx
import React, { useState, useEffect } from 'react';
import type { ReservationFormData } from '@/types/forms/reservationForm';
import { useMatching } from '@/hooks/domain/useMatching';
import { format, addDays } from 'date-fns';
import {
  HOUSING_TYPES,
  SERVICE_OPTIONS,
  ROOM_SIZES_LIFE_CLEANING,
  MAX_COUNTABLE_ITEMS,
  SERVICE_DETAIL_TYPES,
} from '@/constants/service';
import { useReservation } from '@/hooks/domain/reservation';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks';
import {
  CalendarDaysIcon,
  MapPinIcon,
  HomeIcon,
  SparklesIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { ROUTES } from '@/constants';
import { Header } from '@/components';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
import CustomSelect from '@/components/features/manager/CustomSelect';

interface Props {
  initialData: Partial<ReservationFormData>;
  onBack: () => void;
  onSubmit: (form: ReservationFormData) => void;
}

// 서비스 옵션 카운트 타입
interface ServiceOptionCounts {
  [key: string]: number;
}

// 단계 정의
const STEPS = [
  { id: 1, title: '주소 입력', icon: MapPinIcon },
  { id: 2, title: '주택 정보', icon: HomeIcon },
  { id: 3, title: '추가 서비스', icon: SparklesIcon },
  { id: 4, title: '날짜 & 매니저', icon: CalendarDaysIcon },
  { id: 5, title: '최종 확인', icon: CurrencyDollarIcon },
];

const ReservationStep2: React.FC<Props> = ({
  initialData,
  onBack,
  onSubmit,
}) => {
  const { createReservation } = useReservation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);

  const [form, setForm] = useState<ReservationFormData>({
    serviceType: initialData.serviceType || 'GENERAL_CLEANING',
    serviceDetailType: initialData.serviceDetailType || '생활청소',
    address: initialData.address || '',
    addressDetail: initialData.addressDetail || '',
    housingType: initialData.housingType || 'APT',
    reservationDate: initialData.reservationDate || '',
    startTime: initialData.startTime || '09:00',
    endTime: initialData.endTime || '',
    pet: initialData.pet || 'NONE',
    managerUuid: initialData.managerUuid || '',
    chooseManager: initialData.chooseManager || false,
    lifeCleaningRoomIdx: initialData.lifeCleaningRoomIdx || 0,
    serviceOptions: initialData.serviceOptions || [],
    housingInformation: initialData.housingInformation || '',
    specialRequest: initialData.specialRequest || '',
    managerInfo: initialData.managerInfo || undefined,
  });

  // 생활청소 평수 구간 선택 상태
  const [selectedRoomIdx, setSelectedRoomIdx] = useState<number>(0);

  // 서비스 옵션 선택 상태
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // 개수 선택 가능한 옵션의 카운트
  const [optionCounts, setOptionCounts] = useState<ServiceOptionCounts>({});

  const [showManagerModal, setShowManagerModal] = useState(false);
  const [managerList, setManagerList] = useState<any[]>([]);

  const { fetchAvailableManagers } = useMatching();

  // 생활청소 시간/요금 정보 계산
  const getLifeCleaningInfo = () => {
    if (form.serviceDetailType !== '생활청소') return null;
    return ROOM_SIZES_LIFE_CLEANING[selectedRoomIdx];
  };

  // 총 시간 및 가격 계산
  const calculateTotalTimeAndPrice = () => {
    const baseInfo = getLifeCleaningInfo();
    if (!baseInfo) return { totalTime: 0, totalPrice: 0 };

    let additionalTime = 0;
    let additionalPrice = 0;

    selectedServices.forEach((serviceId) => {
      const service = SERVICE_OPTIONS.find((opt) => opt.id === serviceId);
      if (service) {
        const count = service.countable ? optionCounts[serviceId] || 1 : 1;
        additionalTime += service.timeAdd * count;
        additionalPrice += service.priceAdd * count;
      }
    });

    const totalTime = baseInfo.baseTime * 60 + additionalTime;
    const totalPrice = baseInfo.estimatedPrice + additionalPrice;

    return { totalTime, totalPrice };
  };

  // 서비스 옵션 토글
  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev: string[]) => {
      if (prev.includes(serviceId)) {
        setOptionCounts((counts: ServiceOptionCounts) => {
          const newCounts = { ...counts };
          delete newCounts[serviceId];
          return newCounts;
        });
        return prev.filter((id) => id !== serviceId);
      }
      return [...prev, serviceId];
    });
  };

  // 옵션 개수 변경
  const handleCountChange = (serviceId: string, count: number) => {
    if (count >= 1 && count <= MAX_COUNTABLE_ITEMS) {
      setOptionCounts((prev: ServiceOptionCounts) => ({
        ...prev,
        [serviceId]: count,
      }));
    }
  };

  // 예약 정보에 시간 자동 반영
  useEffect(() => {
    const { totalTime } = calculateTotalTimeAndPrice();
    const startHour = parseInt(form.startTime.split(':')[0]);
    const startMinute = parseInt(form.startTime.split(':')[1]);

    const endTime = new Date();
    endTime.setHours(startHour);
    endTime.setMinutes(startMinute + totalTime);

    const endTimeString = `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`;

    setForm((prev: ReservationFormData) => ({
      ...prev,
      endTime: endTimeString,
    }));
  }, [form.startTime, selectedServices, optionCounts, selectedRoomIdx]);

  // 매니저 선택 관련 함수들
  const handleManagerToggle = () => {
    setForm((prev: ReservationFormData) => ({
      ...prev,
      chooseManager: !prev.chooseManager,
      // 토글을 비활성화할 때 기존 매니저 선택 정보도 초기화
      ...(!prev.chooseManager
        ? {}
        : { managerUuid: '', managerInfo: undefined }),
    }));
    if (!form.chooseManager) {
      handleManagerSelect();
    }
  };

  const handleManagerSelect = async () => {
    try {
      const startDateTime = `${form.reservationDate}T${form.startTime}`;
      const endDateTime = `${form.reservationDate}T${form.endTime}`;

      const request = {
        address: form.address,
        startTime: startDateTime,
        endTime: endDateTime,
        managerChoose: true,
      };

      const result = await fetchAvailableManagers(request);
      if (Array.isArray(result)) {
        setManagerList(
          result.map((manager) => ({
            ...manager,
          })),
        );
        setShowManagerModal(true);
      } else {
        showToast('매니저 목록을 불러올 수 없습니다.', 'error');
      }
    } catch (error) {
      showToast('매니저 조회 중 오류가 발생했습니다.', 'error');
    }
  };

  // 주소에서 구/시 단위 추출 (백엔드 로직과 동일)
  const extractGuFromAddress = (address: string): string | null => {
    const addressParts = address.split(' ');

    if (address.startsWith('서')) {
      // 서울시인 경우 "구" 단위 추출
      const gu = addressParts.find((part) => part.endsWith('구'));
      return gu || null;
    } else {
      // 서울시가 아닌 경우 "시" 단위 추출
      const si = addressParts.find((part) => part.endsWith('시'));
      return si || null;
    }
  };

  // 주소 유효성 검사
  const validateAddress = (address: string): boolean => {
    const extracted = extractGuFromAddress(address);
    if (!extracted) {
      if (address.startsWith('서')) {
        showToast(
          '서울시 주소의 경우 "구" 단위가 포함되어야 합니다. (예: 강남구, 동대문구)',
          'error',
        );
      } else {
        showToast(
          '주소에 "시" 단위가 포함되어야 합니다. (예: 부산시, 대구시)',
          'error',
        );
      }
      return false;
    }
    return true;
  };

  // 단계별 유효성 검사
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!form.address.trim()) {
          showToast('주소를 입력해주세요.', 'error');
          return false;
        }
        if (!validateAddress(form.address)) {
          return false;
        }
        if (!form.addressDetail.trim()) {
          showToast('상세 주소를 입력해주세요.', 'error');
          return false;
        }
        return true;
      case 2:
        return true; // 주택 유형과 평수는 기본값이 있음
      case 3:
        return true; // 추가 서비스는 선택사항
      case 4:
        if (!form.reservationDate) {
          showToast('예약 날짜를 선택해주세요.', 'error');
          return false;
        }
        if (!form.startTime) {
          showToast('시작 시간을 선택해주세요.', 'error');
          return false;
        }
        const now = new Date();
        const reservationDate = new Date(form.reservationDate);
        if (reservationDate < now) {
          showToast('예약 날짜는 오늘 이후의 날짜로 선택해주세요.', 'error');
          return false;
        }
        if (form.chooseManager && !form.managerUuid) {
          showToast('매니저를 선택해주세요.', 'error');
          return false;
        }
        return true;
      case 5:
        return true; // 최종 확인 단계
      default:
        return true;
    }
  };

  // 다음 단계로
  const handleNext = async () => {
    if (validateCurrentStep()) {
      // case4(날짜&매니저)에서 case5(최종확인)로 넘어갈 때 매니저 자동 배정
      if (currentStep === 4 && (!form.managerUuid || !form.managerInfo)) {
        // 자동 배정 fetch
        const startDateTime = `${form.reservationDate}T${form.startTime}`;
        const endDateTime = `${form.reservationDate}T${form.endTime}`;
        const request = {
          address: form.address,
          startTime: startDateTime,
          endTime: endDateTime,
          managerChoose: false,
        };
        const result = await fetchAvailableManagers(request);
        if (Array.isArray(result) && result.length > 0) {
          const manager = result[0];
          setForm((prev: ReservationFormData) => ({
            ...prev,
            managerUuid: manager.uuid,
            managerInfo: {
              uuid: manager.uuid,
              name: manager.name,
              profileImage: manager.profileImage,
              averageRate: manager.averageRate,
              introduceText: manager.introduceText,
            },
          }));
        } else {
          return; // 다음 단계로 넘어가지 않음
        }
      }
      setCurrentStep((prev) => prev + 1);
    }
  };

  // 이전 단계로
  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onBack();
    }
  };

  // 예약 완료 버튼 로딩 상태
  const [isSubmitting, setIsSubmitting] = useState(false);

  // currentStep이 변경될 때마다 스크롤 맨 위로 이동
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // 상위 컨테이너 찾아서 스크롤
      const scrollableElement = document.querySelector('.main-container') || 
                               document.querySelector('[data-scroll]') ||
                               document.documentElement;
      if (scrollableElement) {
        scrollableElement.scrollTop = 0;
      }
    }, 100);
  }, [currentStep]);

  // 최종 제출
  const handleFinalSubmit = async () => {
    // 중복 클릭 방지
    if (isSubmitting) return;

    setIsSubmitting(true);
    // serviceDetailTypeId는 실제 서비스 상세 타입의 id(숫자)로 전달해야 함
    const serviceDetail =
      SERVICE_DETAIL_TYPES[form.serviceDetailType || '생활청소'];
    if (!serviceDetail) {
      showToast('서비스 상세 타입 정보가 올바르지 않습니다.', 'error');
      return;
    }
    // serviceOptions는 [{id, count}] 형태, count는 항상 1 이상
    const serviceOptions = selectedServices
      .map((id) => {
        const opt = SERVICE_OPTIONS.find((s) => s.id === id);
        return opt
          ? { id, count: opt.countable ? optionCounts[id] || 1 : 1 }
          : null;
      })
      .filter(Boolean);
    const reservationPayload = {
      serviceDetailTypeId: serviceDetail.id,
      address: form.address,
      addressDetail: form.addressDetail,
      managerUuid: form.managerUuid,
      housingType: form.housingType,
      lifeCleaningRoomIdx: selectedRoomIdx,
      housingInformation: form.housingInformation,
      reservationDate: form.reservationDate,
      startTime: form.startTime,
      endTime: form.endTime,
      serviceOptions,
      pet: form.pet,
      specialRequest: form.specialRequest,
      totalPrice: calculateTotalTimeAndPrice().totalPrice,
    };
    try {
      const result = await createReservation(reservationPayload);
      if (result.success) {
        showToast('예약이 완료되었습니다!', 'success');
        if (onSubmit) onSubmit(form); // 부모에 예약 완료 알림
        navigate('/'); // 홈으로 이동(필요시 경로 수정)
      } else {
        showToast('예약 요청 실패: ' + (result.error || '오류'), 'error');
      }
    } catch (e) {
      showToast('서버 오류 발생', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 반려동물 모달 상태
  const [petModal, setPetModal] = useState(false);
  const [petType, setPetType] = useState<{
    dog: boolean;
    cat: boolean;
    etc: string;
  }>({
    dog: false,
    cat: false,
    etc: '',
  });

  const handlePetToggle = () => {
    setPetModal(true);
  };

  const handlePetSave = () => {
    const pets: string[] = [];
    if (petType.dog) pets.push('DOG');
    if (petType.cat) pets.push('CAT');
    if (petType.etc.trim()) pets.push(petType.etc.trim());
    setForm((prev: ReservationFormData) => ({
      ...prev,
      pet: pets.length > 0 ? (pets.join(',') as any) : 'NONE',
    }));
    setPetModal(false);
  };

  // 날짜 설정
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const [selectedDate, setSelectedDate] = useState<Date>(tomorrow);

  useEffect(() => {
    setForm((prev: ReservationFormData) => ({
      ...prev,
      reservationDate: format(selectedDate, 'yyyy-MM-dd'),
      startTime: prev.startTime || '09:00',
    }));
  }, [selectedDate]);

  // 날짜, 시간, 주소, 평수 등 예약 조건이 바뀔 때 매니저 정보 초기화
  useEffect(() => {
    setForm((prev: ReservationFormData) => ({
      ...prev,
      managerUuid: '',
      managerInfo: undefined,
    }));
    // eslint-disable-next-line
  }, [
    form.reservationDate,
    form.startTime,
    form.address,
    form.addressDetail,
    selectedRoomIdx,
  ]);

  // 단계별 컴포넌트 렌더링
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <MapPinIcon className="w-16 h-16 mx-auto text-orange-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                주소를 입력해주세요
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                정확한 주소를 입력하면 더 나은 서비스를 제공할 수 있어요
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  주소
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 form-input dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="서울특별시 서초구 서초대로 74길 29"
                    value={form.address}
                    onChange={(e) =>
                      setForm((prev: ReservationFormData) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                  />
                  <button
                    onClick={() => navigate(ROUTES.GOOGLE_MAP)}
                    // onClick={() => alert("서비스 준비중입니다.")}
                    className="px-4 py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors whitespace-nowrap"
                    type="button"
                  >
                    위치 찾기
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  상세 주소
                </label>
                <input
                  type="text"
                  className="w-full form-input dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="동/호수, 층수 등 상세 주소를 입력해주세요"
                  value={form.addressDetail}
                  onChange={(e) =>
                    setForm((prev: ReservationFormData) => ({
                      ...prev,
                      addressDetail: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  출입 안내 (선택사항)
                </label>
                <input
                  type="text"
                  className="w-full form-input dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="현관 비밀번호, 출입 방법 등을 알려주세요"
                  value={form.housingInformation}
                  onChange={(e) =>
                    setForm((prev: ReservationFormData) => ({
                      ...prev,
                      housingInformation: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <HomeIcon className="w-16 h-16 mx-auto text-orange-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                주택 정보를 알려주세요
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                주택 유형과 크기에 따라 최적의 서비스를 제공해드려요
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  주택 유형
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(HOUSING_TYPES).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() =>
                        setForm((prev: ReservationFormData) => ({
                          ...prev,
                          housingType: key as any,
                        }))
                      }
                      className={`p-4 rounded-xl border-2 transition-all font-medium ${
                        form.housingType === key
                          ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/50 dark:border-orange-500 dark:text-orange-400'
                          : 'border-gray-200 hover:border-orange-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:border-orange-500'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {form.serviceDetailType === '생활청소' && (
                <div>
                  <CustomSelect
                    value={selectedRoomIdx?.toString() || ''}
                    onChange={(value) => setSelectedRoomIdx(value ? Number(value) : 0)}
                    options={ROOM_SIZES_LIFE_CLEANING.map((_, idx) => idx.toString())}
                    optionLabels={ROOM_SIZES_LIFE_CLEANING.reduce((acc, item, idx) => {
                      acc[idx.toString()] = `${item.range} - ${item.baseTime}시간 소요 (${item.estimatedPrice.toLocaleString()}원)`;
                      return acc;
                    }, {} as Record<string, string>)}
                    placeholder="평수를 선택해주세요"
                    label="평수 선택"
                    icon="calendar"
                  />
                  
                  {selectedRoomIdx !== null && selectedRoomIdx >= 0 && (
                    <div className="bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-700 rounded-xl p-4 mt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-gray-800 dark:text-white">
                            {ROOM_SIZES_LIFE_CLEANING[selectedRoomIdx]?.range}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {ROOM_SIZES_LIFE_CLEANING[selectedRoomIdx]?.baseTime}시간 소요
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-xl text-orange-600">
                            {ROOM_SIZES_LIFE_CLEANING[selectedRoomIdx]?.estimatedPrice.toLocaleString()}원
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            기본 요금
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <SparklesIcon className="w-16 h-16 mx-auto text-orange-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                추가 서비스를 선택해주세요
              </h2>
              <p className="text-gray-600 dark:text-gray-400">필요한 서비스만 선택하시면 됩니다</p>
            </div>

            <div className="space-y-4">
              {SERVICE_OPTIONS.map((service) => (
                <div
                  key={service.id}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    selectedServices.includes(service.id)
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/50'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={service.id}
                        checked={selectedServices.includes(service.id)}
                        onChange={() => handleServiceToggle(service.id)}
                        // className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        className="checkbox-orange"
                      />
                      <label
                        htmlFor={service.id}
                        className="font-medium text-gray-800 dark:text-white cursor-pointer"
                      >
                        {service.label}
                      </label>
                    </div>
                    <div className="text-orange-600 font-bold">
                      +
                      {service.countable &&
                      selectedServices.includes(service.id)
                        ? (
                            service.priceAdd * (optionCounts[service.id] || 1)
                          ).toLocaleString()
                        : service.priceAdd.toLocaleString()}
                      원
                    </div>
                  </div>

                  {service.countable &&
                    selectedServices.includes(service.id) && (
                      <div className="mt-3 flex items-center gap-3 pl-8">
                        <button
                          onClick={() =>
                            handleCountChange(
                              service.id,
                              (optionCounts[service.id] || 1) - 1,
                            )
                          }
                          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          disabled={(optionCounts[service.id] || 1) <= 1}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium dark:text-white">
                          {optionCounts[service.id] || 1}
                        </span>
                        <button
                          onClick={() =>
                            handleCountChange(
                              service.id,
                              (optionCounts[service.id] || 1) + 1,
                            )
                          }
                          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-orange-600 transition-colors"
                          disabled={
                            (optionCounts[service.id] || 1) >=
                            MAX_COUNTABLE_ITEMS
                          }
                        >
                          +
                        </button>
                        <span className="text-sm text-gray-500 dark:text-gray-400">개</span>
                      </div>
                    )}
                </div>
              ))}
            </div>

            {/* 반려동물 및 특이사항 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">특이사항</h3>

              <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                <span className="font-medium text-gray-800 dark:text-white">
                  반려동물이 있어요
                </span>
                <button
                  onClick={handlePetToggle}
                  className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                    form.pet !== 'NONE' ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transform transition-transform duration-200 ${
                      form.pet !== 'NONE' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <textarea
                className="w-full form-input resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={3}
                placeholder="매니저가 알아야 할 특이사항이 있다면 알려주세요 (예: 집 구조, 주의사항 등)"
                value={form.specialRequest}
                onChange={(e) =>
                  setForm((prev: ReservationFormData) => ({
                    ...prev,
                    specialRequest: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <CalendarDaysIcon className="w-16 h-16 mx-auto text-orange-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                예약 날짜와 매니저 선택
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                날짜와 시간, 매니저를 선택해주세요
              </p>
            </div>
            {/* 날짜 선택 카드 */}
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-6 transition-all hover:border-orange-200 dark:hover:border-orange-700 hover:shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  날짜 선택
                </h3>
              </div>

              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date as Date)}
                minDate={tomorrow}
                dateFormat="yyyy년 MM월 dd일"
                locale={ko}
                className="w-full h-16 form-input text-center text-lg font-semibold shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                calendarClassName="!border-orange-200 !rounded-2xl !shadow-xl !border-2 dark:!bg-gray-800 dark:!border-gray-700"
                dayClassName={(date) =>
                  format(date, 'yyyy-MM-dd') ===
                  format(selectedDate, 'yyyy-MM-dd')
                    ? '!bg-orange-500 !text-white !rounded-full !shadow-md'
                    : '!hover:bg-orange-50 dark:!hover:bg-orange-900/50 !rounded-full'
                }
                showPopperArrow={false}
                placeholderText="날짜를 선택해주세요"
              />

              {selectedDate && (
                <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900 dark:to-amber-800 border border-orange-100 dark:border-orange-800 rounded-xl">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-orange-600 dark:text-orange-400 font-medium">
                      선택된 날짜:
                    </span>
                    <span className="font-semibold text-orange-800 dark:text-orange-300">
                      {format(selectedDate, 'yyyy년 MM월 dd일 (E)', {
                        locale: ko,
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 시간 선택 카드 */}
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-6 transition-all hover:border-orange-200 dark:hover:border-orange-700 hover:shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  시작 시간
                </h3>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {Array.from({ length: 32 }).map((_, i) => {
                  const hour = 6 + Math.floor(i / 2);
                  const minute = i % 2 === 0 ? '00' : '30';
                  const time = `${String(hour).padStart(2, '0')}:${minute}`;
                  if (hour >= 6 && hour <= 21) {
                    return (
                      <button
                        key={time}
                        onClick={() =>
                          setForm((prev: ReservationFormData) => ({
                            ...prev,
                            startTime: time,
                          }))
                        }
                        className={`p-3 rounded-xl border-2 transition-all font-medium text-sm shadow-sm hover:shadow-md ${
                          form.startTime === time
                            ? 'border-orange-500 bg-orange-500 text-white shadow-orange-200'
                            : 'border-gray-200 hover:border-orange-300 text-gray-700 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:border-orange-500'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  }
                  return null;
                })}
              </div>

              {form.startTime && (
                <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900 dark:to-amber-800 border border-orange-100 dark:border-orange-800 rounded-xl">
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-700 dark:text-orange-400 font-medium">시작:</span>
                      <span className="font-semibold text-orange-800 dark:text-orange-300">
                        {form.startTime}
                      </span>
                    </div>
                    <div className="w-px h-4 bg-orange-300 dark:bg-orange-700"></div>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-700 dark:text-orange-400 font-medium">종료:</span>
                      <span className="font-semibold text-orange-800 dark:text-orange-300">
                        {(() => {
                          const [startHour, startMinute] = form.startTime
                            .split(':')
                            .map(Number);
                          const totalMinutes =
                            startHour * 60 +
                            startMinute +
                            calculateTotalTimeAndPrice().totalTime;
                          const endHour = Math.floor(totalMinutes / 60) % 24;
                          const endMin = totalMinutes % 60;
                          return `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
                        })()}
                      </span>
                    </div>
                    <div className="text-xs text-orange-600 bg-orange-100 dark:bg-orange-800 dark:text-orange-300 px-2 py-1 rounded-full">
                      {Math.floor(calculateTotalTimeAndPrice().totalTime / 60)}
                      시간
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 매니저 선택 카드 */}
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-6 transition-all hover:border-orange-200 dark:hover:border-orange-700 hover:shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  매니저 선택
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700">
                  <div>
                    <span className="font-medium text-gray-800 dark:text-white block">
                      매니저 직접 선택
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      원하는 매니저를 선택할 수 있어요
                    </span>
                  </div>
                  <button
                    onClick={handleManagerToggle}
                    className={`w-12 h-6 rounded-full transition-colors duration-200 shadow-inner ${
                      form.chooseManager ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transform transition-transform duration-200 shadow-sm ${
                        form.chooseManager ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {form.chooseManager && (
                  <button
                    onClick={handleManagerSelect}
                    className="w-full py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium shadow-md hover:shadow-lg"
                  >
                    매니저 목록 보기
                  </button>
                )}

                {!form.chooseManager && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-800 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <CheckCircleIcon className="w-5 h-5" />
                      <span className="font-medium">자동 배정</span>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      해당 시간대에 가능한 최적의 매니저를 자동으로 배정해드려요
                    </p>
                  </div>
                )}

                {form.managerInfo && (
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900 dark:to-amber-800 border-2 border-orange-200 dark:border-orange-700 rounded-xl p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          form.managerInfo.profileImage ||
                          '/default-profile.png'
                        }
                        alt={form.managerInfo.name}
                        className="w-14 h-14 rounded-full object-cover shadow-md border-2 border-white"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 dark:text-white">
                            {form.managerInfo.name}
                          </span>
                          <span className="text-orange-500 font-bold text-sm bg-orange-100 dark:bg-orange-800 dark:text-orange-300 px-2 py-0.5 rounded-full">
                            ★ {form.managerInfo.averageRate}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {form.managerInfo.introduceText}
                        </p>
                      </div>
                      <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        const baseInfo = getLifeCleaningInfo();
        let additionalTime = 0;
        let additionalTimeDesc: string[] = [];
        selectedServices.forEach((serviceId) => {
          const service = SERVICE_OPTIONS.find((opt) => opt.id === serviceId);
          if (service) {
            const count = service.countable ? optionCounts[serviceId] || 1 : 1;
            if (service.timeAdd > 0) {
              additionalTime += service.timeAdd * count;
              additionalTimeDesc.push(
                `${service.label}${service.countable ? ` x${count}` : ''} +${service.timeAdd * count}분`,
              );
            }
          }
        });
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <CurrencyDollarIcon className="w-16 h-16 mx-auto text-orange-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                예약 정보를 확인해주세요
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                모든 정보가 정확한지 확인 후 예약을 완료해주세요
              </p>
            </div>

            <div className="space-y-6">
              {/* 주소 정보 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-100 dark:border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPinIcon className="w-5 h-5 text-orange-500" />
                  <span className="font-semibold text-gray-800 dark:text-white">
                    서비스 주소
                  </span>
                </div>
                <div className="text-gray-700 dark:text-gray-300">
                  <p>{form.address}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{form.addressDetail}</p>
                  {form.housingInformation && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      출입 정보: {form.housingInformation}
                    </p>
                  )}
                </div>
              </div>

              {/* 주택 정보 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-100 dark:border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <HomeIcon className="w-5 h-5 text-orange-500" />
                  <span className="font-semibold text-gray-800 dark:text-white">주택 정보</span>
                </div>
                <div className="text-gray-700 dark:text-gray-300">
                  <p>
                    주택 유형:{' '}
                    {
                      HOUSING_TYPES[
                        form.housingType as keyof typeof HOUSING_TYPES
                      ]
                    }
                  </p>
                  {form.serviceDetailType === '생활청소' && (
                    <p>
                      평수: {ROOM_SIZES_LIFE_CLEANING[selectedRoomIdx].range}
                    </p>
                  )}
                </div>
              </div>

              {/* 예약 일시 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-100 dark:border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDaysIcon className="w-5 h-5 text-orange-500" />
                  <span className="font-semibold text-gray-800 dark:text-white">예약 일시</span>
                </div>
                <div className="text-gray-700 dark:text-gray-300">
                  <p>
                    {format(
                      new Date(form.reservationDate),
                      'yyyy년 MM월 dd일',
                      { locale: ko },
                    )}
                  </p>
                  <p>
                    {form.startTime} ~ {form.endTime}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    예상 소요 시간:{' '}
                    {Math.floor(calculateTotalTimeAndPrice().totalTime / 60)}
                    시간 {calculateTotalTimeAndPrice().totalTime % 60}분
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    (기본 {baseInfo?.baseTime}시간
                    {additionalTime > 0 && (
                      <>
                        {' '}
                        + 추가{' '}
                        {Math.floor(additionalTime / 60) > 0
                          ? `${Math.floor(additionalTime / 60)}시간 `
                          : ''}
                        {additionalTime % 60 > 0
                          ? `${additionalTime % 60}분`
                          : ''}
                        {additionalTimeDesc.length > 0 && (
                          <>
                            <br />
                            {additionalTimeDesc.join(', ')}
                          </>
                        )}
                      </>
                    )}
                    )
                  </p>
                </div>
              </div>

              {/* 추가 서비스 */}
              {selectedServices.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-100 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <SparklesIcon className="w-5 h-5 text-orange-500" />
                    <span className="font-semibold text-gray-800 dark:text-white">
                      추가 서비스
                    </span>
                  </div>
                  <div className="space-y-2">
                    {selectedServices.map((serviceId) => {
                      const service = SERVICE_OPTIONS.find(
                        (opt) => opt.id === serviceId,
                      );
                      if (!service) return null;
                      const count = service.countable
                        ? optionCounts[serviceId] || 1
                        : 1;
                      return (
                        <div
                          key={serviceId}
                          className="flex justify-between text-gray-700 dark:text-gray-300"
                        >
                          <span>
                            {service.label}
                            {service.countable ? ` x${count}` : ''}
                          </span>
                          <span>
                            +{(service.priceAdd * count).toLocaleString()}원
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 특이사항 */}
              {(form.pet !== 'NONE' || form.specialRequest) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-100 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-semibold text-gray-800 dark:text-white">
                      특이사항
                    </span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 space-y-1">
                    {form.pet !== 'NONE' && <p>반려동물: {form.pet}</p>}
                    {form.specialRequest && (
                      <p>요청사항: {form.specialRequest}</p>
                    )}
                  </div>
                </div>
              )}

              {/* 매니저 정보 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-100 dark:border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <UserGroupIcon className="w-5 h-5 text-orange-500" />
                  <span className="font-semibold text-gray-800 dark:text-white">매니저</span>
                </div>
                {form.managerInfo ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        form.managerInfo.profileImage || '/default-profile.png'
                      }
                      alt={form.managerInfo.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium dark:text-white">
                          {form.managerInfo.name}
                        </span>
                        <span className="text-orange-500 text-sm">
                          ★ {form.managerInfo.averageRate}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {form.managerInfo.introduceText}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 dark:text-gray-300">배정된 매니저가 없습니다.</p>
                )}
              </div>

              {/* 요금 정보 */}
              <div className="bg-orange-50 dark:bg-orange-900/50 rounded-xl border-2 border-orange-100 dark:border-orange-800 p-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>기본 요금</span>
                    <span>{baseInfo?.estimatedPrice.toLocaleString()}원</span>
                  </div>
                  {selectedServices.map((serviceId) => {
                    const service = SERVICE_OPTIONS.find(
                      (opt) => opt.id === serviceId,
                    );
                    if (!service) return null;
                    const count = service.countable
                      ? optionCounts[serviceId] || 1
                      : 1;
                    return (
                      <div
                        key={serviceId}
                        className="flex justify-between text-gray-700 dark:text-gray-300"
                      >
                        <span>
                          {service.label}
                          {service.countable ? ` x${count}` : ''}
                        </span>
                        <span>
                          +{(service.priceAdd * count).toLocaleString()}원
                        </span>
                      </div>
                    );
                  })}
                  <div className="border-t border-orange-200 dark:border-orange-700 pt-3 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800 dark:text-white">
                      총 금액
                    </span>
                    <span className="text-2xl font-bold text-orange-600">
                      {calculateTotalTimeAndPrice().totalPrice.toLocaleString()}
                      원
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getHeaderTitle = () => {
    switch (currentStep) {
      case 1:
        return '주소 입력';
      case 2:
        return '주택 정보 입력';
      case 3:
        return '추가 서비스 선택';
      case 4:
        return '매니저 선택';
      case 5:
        return '예약 확인';
      default:
        return '서비스 예약';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        variant="sub"
        title={getHeaderTitle()}
        backRoute={ROUTES.HOME}
        showMenu={false}
      />

      {/* 진행 단계 표시 */}
      <div className="bg-gray-50 dark:bg-gray-900 px-10 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step.id <= currentStep
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {step.id}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-3 transition-colors ${
                      step.id < currentStep ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="px-4 py-2 pb-24">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            {renderStepContent()}
          </div>

          {/* 하단 네비게이션 버튼 */}
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="max-w-md mx-auto flex gap-3">
              <button
                onClick={handlePrev}
                className="flex items-center justify-center px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                이전
              </button>

              {currentStep < STEPS.length ? (
                <button
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
                >
                  다음
                  <ChevronRightIcon className="w-5 h-5 ml-1" />
                </button>
              ) : (
                <button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className={`flex-1 flex items-center justify-center px-6 py-3 rounded-xl transition-colors font-medium ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600'
                  } text-white`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      예약 처리 중...
                    </div>
                  ) : (
                    <>
                      예약 완료
                      <CheckCircleIcon className="w-5 h-5 ml-1" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 매니저 선택 모달 */}
      {showManagerModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowManagerModal(false);
              // 매니저가 선택되지 않았다면 토글을 비활성화하고 매니저 정보 초기화
              if (!form.managerUuid) {
                setForm((prev: ReservationFormData) => ({
                  ...prev,
                  chooseManager: false,
                  managerUuid: '',
                  managerInfo: undefined,
                }));
              }
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">매니저 선택</h3>
                <button
                  onClick={() => {
                    setShowManagerModal(false);
                    // 매니저가 선택되지 않았다면 토글을 비활성화하고 매니저 정보 초기화
                    if (!form.managerUuid) {
                      setForm((prev: ReservationFormData) => ({
                        ...prev,
                        chooseManager: false,
                        managerUuid: '',
                        managerInfo: undefined,
                      }));
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-96 p-4">
              <div className="space-y-3">
                {managerList.map((manager) => (
                  <button
                    key={manager.uuid}
                    className={`w-full p-4 border-2 rounded-xl transition-all text-left ${
                      form.managerUuid === manager.uuid
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/50'
                        : 'border-gray-200 hover:border-orange-300 dark:border-gray-700 dark:hover:border-orange-500'
                    }`}
                    onClick={() => {
                      setForm((prev: ReservationFormData) => ({
                        ...prev,
                        managerUuid: manager.uuid,
                        managerInfo: {
                          uuid: manager.uuid,
                          name: manager.name,
                          profileImage: manager.profileImage,
                          averageRate: manager.averageRate,
                          introduceText: manager.introduceText,
                        },
                      }));
                      setShowManagerModal(false);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={manager.profileImage || '/default-profile.png'}
                        alt={manager.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-800 dark:text-white truncate">
                            {manager.name}
                          </span>
                          <span className="text-orange-500 font-bold text-sm">
                            ★ {manager.averageRate}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {manager.introduceText}
                        </p>
                      </div>
                      {form.managerUuid === manager.uuid && (
                        <CheckCircleIcon className="w-6 h-6 text-orange-500 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 반려동물 모달 */}
      {petModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  반려동물 정보
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  반려동물이 있다면 알려주세요.
                  <br />
                  알레르기가 있는 매니저를 피할 수 있어요.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={petType.dog}
                      onChange={(e) =>
                        setPetType(
                          (pt: {
                            dog: boolean;
                            cat: boolean;
                            etc: string;
                          }) => ({ ...pt, dog: e.target.checked }),
                        )
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                        petType.dog
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                      }`}
                    >
                      🐕
                    </div>
                    <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      강아지
                    </span>
                  </label>

                  <label className="flex flex-col items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={petType.cat}
                      onChange={(e) =>
                        setPetType(
                          (pt: {
                            dog: boolean;
                            cat: boolean;
                            etc: string;
                          }) => ({ ...pt, cat: e.target.checked }),
                        )
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                        petType.cat
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                      }`}
                    >
                      🐱
                    </div>
                    <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      고양이
                    </span>
                  </label>
                </div>

                <input
                  type="text"
                  className="w-full form-input dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="기타 (예: 토끼, 햄스터 등)"
                  value={petType.etc}
                  onChange={(e) =>
                    setPetType(
                      (pt: { dog: boolean; cat: boolean; etc: string }) => ({
                        ...pt,
                        etc: e.target.value,
                      }),
                    )
                  }
                />

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setPetModal(false)}
                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handlePetSave}
                    className="flex-1 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
                  >
                    저장
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationStep2;
