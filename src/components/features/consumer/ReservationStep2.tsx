// src/components/features/consumer/ReservationStep2.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { ReservationFormData } from '@/types/reservation';
import { useMatching } from '@/hooks/domain/useMatching';
import { format, addDays } from 'date-fns';
import { HOUSING_TYPES, SERVICE_OPTIONS, ROOM_SIZES, SERVICE_TYPES, ROOM_SIZES_LIFE_CLEANING, MAX_COUNTABLE_ITEMS } from '@/constants/service';
import ReservationHeader from './ReservationHeader';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';

interface Props {
  initialData: Partial<ReservationFormData>;
  onBack: () => void;
  onSubmit: (form: ReservationFormData) => void;
}

// 서비스 옵션 카운트 타입
interface ServiceOptionCounts {
  [key: string]: number;
}

const ReservationStep2: React.FC<Props> = ({ initialData, onBack, onSubmit }) => {
  const location = useLocation();
  const navigate = useNavigate();
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
    managerUuId: initialData.managerUuId || '',
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
  const [mapLatLng, setMapLatLng] = useState<{ lat: number; lng: number } | null>(null);

  // const { fetchProfile } = useConsumer();

  // 구글맵에서 전달된 주소 자동 반영
  useEffect(() => {
    if (location.state && (location.state as any).address) {
      const { address, lat, lng } = location.state as any;
      setForm(prev => ({ ...prev, address }));
      setMapLatLng(lat && lng ? { lat, lng } : null);
      // history.replaceState로 state 초기화(뒤로가기 시 중복 방지)
      if (window.history.replaceState) {
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state]);

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

    selectedServices.forEach(serviceId => {
      const service = SERVICE_OPTIONS.find(opt => opt.id === serviceId);
      if (service) {
        const count = service.countable ? (optionCounts[serviceId] || 1) : 1;
        additionalTime += service.timeAdd * count;
        additionalPrice += service.priceAdd * count;
      }
    });

    const totalTime = baseInfo.baseTime * 60 + additionalTime; // 분 단위로 변환
    const totalPrice = baseInfo.estimatedPrice + additionalPrice;

    return { totalTime, totalPrice };
  };

  // 서비스 옵션 토글
  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        setOptionCounts(counts => {
          const newCounts = { ...counts };
          delete newCounts[serviceId];
          return newCounts;
        });
        return prev.filter(id => id !== serviceId);
      }
      return [...prev, serviceId];
    });
  };

  // 옵션 개수 변경
  const handleCountChange = (serviceId: string, count: number) => {
    if (count >= 1 && count <= MAX_COUNTABLE_ITEMS) {
      setOptionCounts(prev => ({
        ...prev,
        [serviceId]: count
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
    
    setForm(prev => ({
      ...prev,
      endTime: endTimeString
    }));
  }, [form.startTime, selectedServices, optionCounts, selectedRoomIdx]);

  const handleManagerToggle = () => {
    setForm(prev => ({ ...prev, chooseManager: !prev.chooseManager }));
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
        setManagerList(result.map(manager => ({
          ...manager,
        })));
        setShowManagerModal(true);
      } else {
        alert('매니저 목록을 불러올 수 없습니다.');
      }
    } catch (error) {
      alert('매니저 조회 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async () => {
    // 1. 주소값 체크
    if (!form.address) {
      alert('주소를 입력하세요.');
      addressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      addressRef.current?.focus();
      return;
    }

    if (!form.addressDetail) {
      alert('상세 주소를 입력하세요.');
      addressDetailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      addressDetailRef.current?.focus();
      return;
    }

    // 2. 매니저 직접 선택 체크
    if (form.chooseManager) {
      if (!form.managerUuId) {
        alert('매니저를 선택하세요.');
        return;
      }
    }
    
    // 3. 예약 시간 체크
    const now = new Date();
    const reservationDate = new Date(form.reservationDate);
    if (reservationDate < now) {
      alert('예약 날짜는 오늘 이후의 날짜로 선택해주세요.');
      return;
    }

    let managerUuId = form.managerUuId;
    let selectManager = null;
    if (!form.chooseManager) {
      try {
        const startDateTime = `${form.reservationDate}T${form.startTime}`;
        const endDateTime = `${form.reservationDate}T${form.endTime}`;
        const request = {
          address: form.address,
          startTime: startDateTime,
          endTime: endDateTime,
          managerChoose: false,
        };
        const managers = await fetchAvailableManagers(request);
        if (Array.isArray(managers) && managers.length > 0) {
          selectManager = managers[0];
          managerUuId = selectManager.uuid;
        } else {
          alert('해당 시간에 가능한 매니저가 없습니다.');
          return;
        }
      } catch (error) {
        alert('매니저 자동 배정 중 오류가 발생했습니다.');
        return;
      }
    } else{
      selectManager=managerList.find((manager) => manager.uuid === managerUuId)
    }

    // 최신 옵션 정보 반영
    const serviceOptions = selectedServices.map(id => ({
      id,
      count: SERVICE_OPTIONS.find(opt => opt.id === id && opt.countable) ? (optionCounts[id] || 1) : undefined
    }));
    
    const formData: ReservationFormData = {
      ...form,
      lifeCleaningRoomIdx: selectedRoomIdx,
      serviceOptions,
      managerUuId,
      managerInfo : selectManager
      ? {
          uuid: selectManager.uuid,
          name: selectManager.name,
          profileImage: selectManager.profileImage,
          averageRate: selectManager.averageRate,
          introduceText: selectManager.introduceText,
        }
      : undefined,
      pet: form.pet as any,
    };
    onSubmit(formData);
  };

  // 반려동물 모달 상태
  const [petModal, setPetModal] = useState(false);

  // 반려동물 토글 시 모달 오픈
  const handlePetToggle = () => {
    setPetModal(true);
  };

  // 반려동물 모달 내용
  const [petType, setPetType] = useState<{ dog: boolean; cat: boolean; etc: string }>({ dog: false, cat: false, etc: '' });
  const handlePetSave = () => {
    // 선택된 반려동물 값을 모두 배열로 수집
    const pets: string[] = [];
    if (petType.dog) pets.push('DOG');
    if (petType.cat) pets.push('CAT');
    if (petType.etc.trim()) pets.push(petType.etc.trim());
    setForm(prev => ({ ...prev, pet: pets.length > 0 ? (pets.join(',') as any) : 'NONE' }));
    setPetModal(false);
  };

  // 주소, 상세주소 등 유효성 검사 시 해당 input으로 스크롤 이동
  const addressRef = React.useRef<HTMLInputElement>(null);
  const addressDetailRef = React.useRef<HTMLInputElement>(null);

  // 날짜 및 시간 선택 개선
  const today = new Date();
  const tomorrow = addDays(today, 1);

  // 날짜를 Date 객체로 관리
  const [selectedDate, setSelectedDate] = useState<Date>(tomorrow);

  useEffect(() => {
    // 날짜가 비어있으면 tomorrow로, 시간이 비어있으면 09:00으로 자동 설정
    setForm(prev => ({
      ...prev,
      reservationDate: format(selectedDate, 'yyyy-MM-dd'),
      startTime: prev.startTime || '09:00',
    }));
    // eslint-disable-next-line
  }, [selectedDate]);

  // 종료 시간 계산 함수
  const getExpectedEndTime = () => {
    const [startHour, startMinute] = (form.startTime || '09:00').split(':').map(Number);
    const totalMinutes = startHour * 60 + startMinute + calculateTotalTimeAndPrice().totalTime;
    const endHour = Math.floor(totalMinutes / 60) % 24;
    const endMinute = totalMinutes % 60;
    return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
  };

  // 시간 선택 버튼 그리드 생성
  const timeOptions: string[] = [];
  for (let i = 0; i < 32; i++) {
    const hour = 6 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    if (hour > 21) break;
    timeOptions.push(`${String(hour).padStart(2, '0')}:${minute}`);
  }

  return (
    <>
    
      <ReservationHeader title="예약 정보 입력" onBack={onBack} />
      <div className="pt-16 p-4 space-y-6">

        {/* 주소 입력 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">주소 입력</h3>
          <p className="text-sm text-gray-500">상세 주소를 입력해주세요.</p>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 p-3 border border-gray-300 rounded-lg"
              placeholder="서울특별시 서초구 서초대로 74길 29"
              value={form.address}
              onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
              ref={addressRef}
            />
          
            <button
              // onClick={() => navigate('/google-map')}
              onClick={() => alert("서비스 준비중입니다.")}
              className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              type="button"
            >
              현재 위치에서 찾기
            </button>
          </div>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="상세 주소 입력"
            value={form.addressDetail}
            onChange={(e) => setForm(prev => ({ ...prev, addressDetail: e.target.value }))}
            ref={addressDetailRef}
          />
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg mt-2"
            placeholder="현관 비밀번호 등, 출입을 위한 특이사항을 입력해주세요.(선택)"
            value={form.housingInformation}
            onChange={(e) => setForm(prev => ({ ...prev, housingInformation: e.target.value }))}
          />
        </div>

        {/* 주택 정보 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">주택 유형</h3>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(HOUSING_TYPES).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setForm(prev => ({ ...prev, housingType: key as any }))}
                className={`flex items-center justify-center py-3 rounded-lg border-2 shadow-sm transition-all text-base font-semibold
                  ${form.housingType === key ? 'bg-orange-500 text-white border-orange-500 scale-105' : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 날짜 및 시간 */}
        <div className="space-y-4">
          <div className="rounded-2xl shadow-lg bg-white p-6 border border-orange-100">
            <div className="flex items-center gap-3 mb-2">
              <CalendarDaysIcon className="w-7 h-7 text-orange-500" />
              <h3 className="text-xl font-bold text-orange-600">예약 날짜 및 시간</h3>
            </div>
            <div className="text-gray-500 text-sm mb-4">원하는 예약 날짜와 시작 시간을 선택하세요.</div>
            <div className="mt-14 flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <label className="block text-gray-700 font-medium mb-1">날짜 선택</label>
                <DatePicker
                  selected={selectedDate}
                  onChange={date => setSelectedDate(date as Date)}
                  minDate={tomorrow}
                  dateFormat="yyyy-MM-dd"
                  locale={ko}
                  className="w-full h-12 p-3 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition text-center text-lg font-semibold bg-white"
                  calendarClassName="!border-orange-200 !rounded-xl !shadow-lg"
                  dayClassName={date =>
                    format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                      ? '!bg-orange-500 !text-white !rounded-full'
                      : ''
                  }
                  showPopperArrow={false}
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-gray-700 font-medium mb-1">시작 시간</label>
                <div className="relative">
                  <ClockIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" />
                  <select
                    className="w-full h-12 py-2 px-3 pl-10 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition bg-white text-center text-lg font-semibold appearance-none"
                    value={form.startTime}
                    onChange={e => setForm(prev => ({ ...prev, startTime: e.target.value }))}
                  >
                    <option value="">시간 선택</option>
                    {Array.from({ length: 33 }).map((_, i) => {
                      const hour = 6 + Math.floor(i / 2);
                      const minute = i % 2 === 0 ? '00' : '30';
                      const time = `${String(hour).padStart(2, '0')}:${minute}`;
                      if (hour >= 6 && hour <= 21) {
                        return (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        );
                      }
                      return null;
                    })}
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-14 pt-10 flex flex-col items-center justify-center border-t border-orange-100">
              <div className="flex flex-row items-center justify-center gap-8 w-full max-w-xl mx-auto">
                <div className="flex flex-col items-center flex-1">
                  <CalendarDaysIcon className="w-6 h-6 text-orange-400 mb-1" />
                  <span className="text-xs text-gray-500">선택한 날짜</span>
                  <span className="text-base font-bold text-orange-600 mt-1">{format(selectedDate, 'yyyy-MM-dd')}</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <ClockIcon className="w-6 h-6 text-orange-400 mb-1" />
                  <span className="text-xs text-gray-500">시작 시간</span>
                  <span className="text-base font-bold text-orange-600 mt-1">{form.startTime || '선택 전'}</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <ClockIcon className="w-6 h-6 text-orange-400 mb-1" />
                  <span className="text-xs text-gray-500">예상 종료</span>
                  <span className="text-base font-bold text-orange-600 mt-1">{getExpectedEndTime()}</span>
                </div>
              </div>
              <div className="mt-10 text-gray-400 text-sm mt-3 text-center">(종료 시간은 서비스/옵션에 따라 자동 계산됩니다)</div>
            </div>
          </div>
        </div>

        {/* 생활청소 평수/요금 섹션 */}
        {form.serviceDetailType === '생활청소' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">평수 선택</h3>
            <div className="grid grid-cols-2 gap-2">
              {ROOM_SIZES_LIFE_CLEANING.map((item, idx) => (
                <button
                  key={item.range}
                  onClick={() => setSelectedRoomIdx(idx)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedRoomIdx === idx
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-orange-200'
                  }`}
                >
                  <div className="font-medium">{item.range}</div>
                  <div className="text-sm text-gray-600">
                    {item.baseTime}시간 / {item.estimatedPrice.toLocaleString()}원
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 서비스 옵션 섹션 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">추가 서비스 선택</h3>
          <div className="space-y-2">
            {SERVICE_OPTIONS.map(service => (
              <div key={service.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={service.id}
                      checked={selectedServices.includes(service.id)}
                      onChange={() => handleServiceToggle(service.id)}
                      className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <label htmlFor={service.id} className="font-medium">
                      {service.label}
                    </label>
                  </div>
                  <div className="text-orange-500 font-medium">
                    +{(service.countable && selectedServices.includes(service.id))
                      ? (service.priceAdd * (optionCounts[service.id] || 1)).toLocaleString()
                      : service.priceAdd.toLocaleString()}원
                  </div>
                </div>
                {service.countable && selectedServices.includes(service.id) && (
                  <div className="mt-3 flex items-center gap-2 pl-7">
                    <button
                      onClick={() => handleCountChange(service.id, (optionCounts[service.id] || 1) - 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                      disabled={(optionCounts[service.id] || 1) <= 1}
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{optionCounts[service.id] || 1}</span>
                    <button
                      onClick={() => handleCountChange(service.id, (optionCounts[service.id] || 1) + 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                      disabled={(optionCounts[service.id] || 1) >= MAX_COUNTABLE_ITEMS}
                    >
                      +
                    </button>
                    <span className="text-sm text-gray-500">개</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 반려동물 유무 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">특이 사항</h3>
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <span>반려동물 유무</span>
            <button
              onClick={handlePetToggle}
              className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                form.pet !== 'NONE' ? 'bg-orange-500' : 'bg-gray-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transform transition-transform duration-200 ease-in-out ${
                  form.pet !== 'NONE' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg mt-2"
            placeholder="매니저가 알아야 할 특이사항 (예: 집 구조, 주의사항 등)"
            value={form.specialRequest}
            onChange={e => setForm(prev => ({ ...prev, specialRequest: e.target.value }))}
          />
        </div>

        {/* 매니저 선택 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">매니저 선택</h3>
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <span>매니저 직접 선택</span>
            <button
              onClick={handleManagerToggle}
              className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                form.chooseManager ? 'bg-orange-500' : 'bg-gray-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transform transition-transform duration-200 ease-in-out ${
                  form.chooseManager ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {form.chooseManager && (
            <button
              onClick={handleManagerSelect}
              className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              매니저 선택하기
            </button>
          )}
        </div>

        {/* 매니저 선택 모달 */}
        {showManagerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="relative bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl animate-fade-in">
              {/* 닫기 버튼 */}
              <button
                onClick={() => setShowManagerModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                aria-label="닫기"
              >
                ×
              </button>
              <h3 className="text-xl font-bold mb-6 text-center">매니저 선택</h3>
              <div className="space-y-5">
                {managerList.map((manager) => (
                  <div
                    key={manager.uuid}
                    className={`group p-4 border-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-4 shadow-sm hover:shadow-lg hover:border-orange-400 ${
                      form.managerUuId === manager.uuid ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'
                    }`}
                    onClick={() => {
                      setForm(prev => ({
                        ...prev,
                        managerUuId: manager.uuid,
                        managerInfo: {
                          uuid: manager.uuid,
                          name: manager.name,
                          profileImage: manager.profileImage,
                          averageRate: manager.averageRate,
                          introduceText: manager.introduceText,
                        }
                      }));
                      setShowManagerModal(false);
                    }}
                  >
                    <img
                      src={manager.profileImage || '/default-profile.png'}
                      alt={manager.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 group-hover:border-orange-400"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-lg truncate">{manager.name}</span>
                        <span className="text-orange-500 font-bold text-sm">★ {manager.averageRate}</span>
                      </div>
                      <div className="text-gray-600 text-sm truncate">{manager.introduceText}</div>
                    </div>
                    {form.managerUuId === manager.uuid && (
                      <span className="ml-2 px-2 py-1 bg-orange-500 text-white text-xs rounded-full">선택됨</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 가격 표시 섹션 업데이트 */}
        <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-100">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-gray-600">
              <span>기본 요금</span>
              <span>{getLifeCleaningInfo()?.estimatedPrice.toLocaleString()}원</span>
            </div>
            {selectedServices.length > 0 && (
              <div className="space-y-1">
                {selectedServices.map(serviceId => {
                  const service = SERVICE_OPTIONS.find(opt => opt.id === serviceId);
                  if (!service) return null;
                  const count = service.countable ? (optionCounts[serviceId] || 1) : 1;
                  return (
                    <div key={serviceId} className="flex justify-between items-center text-gray-600">
                      <span>{service.label}{service.countable ? ` x${count}` : ''}</span>
                      <span>+{(service.priceAdd * count).toLocaleString()}원</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="border-t border-orange-200 pt-2 flex justify-between items-center">
              <span className="font-medium">총 금액</span>
              <span className="text-xl font-bold text-orange-500">
                {calculateTotalTimeAndPrice().totalPrice.toLocaleString()}원
              </span>
            </div>
            <div className="text-sm text-gray-500 text-center mt-2">
              예상 소요 시간: {Math.floor(calculateTotalTimeAndPrice().totalTime / 60)}시간 {calculateTotalTimeAndPrice().totalTime % 60}분
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={onBack}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            이전
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            다음
          </button>
        </div>

       

        {/* 반려동물 모달 */}
        {petModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center animate-fade-in relative">
              <button
                onClick={() => setPetModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                aria-label="닫기"
              >
                ×
              </button>
              <div className="flex flex-col items-center mb-6">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-100 mb-2">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                </span>
                <div className="text-2xl font-bold text-orange-600 mb-1">반려동물 정보</div>
                <div className="text-gray-500 text-center text-base">강아지, 고양이 등 반려동물이 있다면 알려주세요.<br/>알레르기 있는 도우미를 피할 수 있습니다.</div>
              </div>
              <div className="flex gap-8 mb-6">
                <label className="flex flex-col items-center cursor-pointer">
                  <input type="checkbox" checked={petType.dog} onChange={e => setPetType(pt => ({ ...pt, dog: e.target.checked }))} className="hidden peer" />
                  <span className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 peer-checked:bg-orange-500 transition-colors">
                    <svg className="w-7 h-7 text-gray-400 peer-checked:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  </span>
                  <span className="mt-2 text-sm font-medium text-gray-700 peer-checked:text-orange-500">강아지</span>
                </label>
                <label className="flex flex-col items-center cursor-pointer">
                  <input type="checkbox" checked={petType.cat} onChange={e => setPetType(pt => ({ ...pt, cat: e.target.checked }))} className="hidden peer" />
                  <span className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 peer-checked:bg-orange-500 transition-colors">
                    <svg className="w-7 h-7 text-gray-400 peer-checked:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  </span>
                  <span className="mt-2 text-sm font-medium text-gray-700 peer-checked:text-orange-500">고양이</span>
                </label>
              </div>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                placeholder="기타 (예: 토끼, 햄스터 등)"
                value={petType.etc}
                onChange={e => setPetType(pt => ({ ...pt, etc: e.target.value }))}
              />
              <button
                onClick={handlePetSave}
                className="w-full py-3 bg-orange-500 text-white rounded-lg font-bold text-lg hover:bg-orange-600 mb-2"
              >
                저장
              </button>
              <button
                onClick={() => setPetModal(false)}
                className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ReservationStep2;
