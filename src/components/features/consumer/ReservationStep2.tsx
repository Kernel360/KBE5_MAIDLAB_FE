// src/components/features/consumer/ReservationStep2.tsx
import React, { useState, useEffect } from 'react';
import type { ReservationFormData } from '@/types/reservation';
import { useMatching } from '@/hooks/domain/useMatching';
import { format, addDays } from 'date-fns';
import { HOUSING_TYPES, SERVICE_OPTIONS, ROOM_SIZES } from '@/constants/service';
import ReservationHeader from './ReservationHeader';
import { useLocation, useNavigate } from 'react-router-dom';

interface Props {
  initialData: Partial<ReservationFormData>;
  onBack: () => void;
  onSubmit: (form: ReservationFormData) => void;
}

const ReservationStep2: React.FC<Props> = ({ initialData, onBack, onSubmit }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState<ReservationFormData>({
    serviceType: initialData.serviceType || 'HOUSEKEEPING',
    serviceDetailType: initialData.serviceDetailType || '대청소',
    address: initialData.address || '',
    addressDetail: initialData.addressDetail || '',
    housingType: initialData.housingType || 'APT',
    roomSize: initialData.roomSize || 10,
    housingInformation: initialData.housingInformation || '',
    reservationDate: initialData.reservationDate || format(new Date(), 'yyyy-MM-dd'),
    startTime: initialData.startTime || '08:00',
    endTime: initialData.endTime || '11:00',
    serviceAdd: initialData.serviceAdd || '',
    pet: initialData.pet || 'NONE',
    specialRequest: initialData.specialRequest || '',
    chooseManager: initialData.chooseManager || false,
    managerUuId: initialData.managerUuId || '',
  });

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [managerList, setManagerList] = useState<any[]>([]);
  const [basePrice] = useState(50000); // 기본 가격 5만원
  const [totalPrice, setTotalPrice] = useState(basePrice);
  const { fetchAvailableManagers } = useMatching();
  const [mapLatLng, setMapLatLng] = useState<{ lat: number; lng: number } | null>(null);

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

  // 시작 시간이 변경되면 3시간 후로 종료 시간 자동 설정 (다음날로 넘어갈 수 있도록)
  useEffect(() => {
    if (form.startTime) {
      const [hours, minutes] = form.startTime.split(':').map(Number);
      let totalMinutes = hours * 60 + minutes + 180; // 기본 3시간
      // 선택된 서비스에 따른 추가 시간 계산
      const additionalMinutes = selectedServices.reduce((acc, serviceId) => {
        const service = SERVICE_OPTIONS.find(s => s.id === serviceId);
        return acc + (service?.timeAdd || 0);
      }, 0);
      totalMinutes += additionalMinutes;
      // 24시간 이상이면 다음날로 넘어감
      let endHours = Math.floor(totalMinutes / 60) % 24;
      let endMinutes = totalMinutes % 60;
      const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
      setForm(prev => ({ ...prev, endTime }));
    }
  }, [form.startTime, selectedServices]);

  // 서비스 선택에 따른 가격 계산
  useEffect(() => {
    const additionalPrice = selectedServices.reduce((acc, serviceId) => {
      const service = SERVICE_OPTIONS.find(s => s.id === serviceId);
      return acc + (service?.price || 0);
    }, 0);
    setTotalPrice(basePrice + additionalPrice);
  }, [selectedServices, basePrice]);

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
          managerUuId = managers[0].uuid;
        } else {
          alert('해당 시간에 가능한 매니저가 없습니다.');
          return;
        }
      } catch (error) {
        alert('매니저 자동 배정 중 오류가 발생했습니다.');
        return;
      }
    }

    // petType 상태를 기반으로 string으로 변환 (이미 form.pet에 반영됨)
    const formData: ReservationFormData = {
      ...form,
      serviceAdd: selectedServices.join(','),
      specialRequest: '',
      managerUuId,
      pet: form.pet as any,
    };
    onSubmit(formData);
  };

  // 서비스 추가 안내 모달 상태
  const [serviceModal, setServiceModal] = useState<{open: boolean, type: string | null}>({open: false, type: null});

  const handleServiceToggle = (serviceId: string) => {
    setServiceModal({open: true, type: serviceId});
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      }
      return [...prev, serviceId];
    });
  };

  // 반려동물 모달 상태
  const [petModal, setPetModal] = useState(false);

  // 반려동물 토글 시 모달 오픈
  const handlePetToggle = () => {
    setPetModal(true);
  };

  // 서비스 안내 모달 내용
  const getServiceModalContent = (type: string | null) => {
    if (type === 'cooking') {
      return {
        title: '요구사항 추가',
        subtitle: '요리',
        desc: (
          <>
            <div>요리 서비스는 기본 예약 시간에 1시간이 추가됩니다.</div>
          </>
        ),
        actions: [
          { label: '확인', color: 'green', onClick: () => setServiceModal({ open: false, type: null }) },
        ],
      };
    }
    if (type === 'ironing') {
      return {
        title: '요구사항 추가',
        subtitle: '다림질',
        desc: (
          <>
            <div>다림질 서비스는 기본 예약 시간에 1시간이 추가됩니다.</div>
          </>
        ),
        actions: [
          { label: '확인', color: 'green', onClick: () => setServiceModal({ open: false, type: null }) },
        ],
      };
    }
    if (type === 'cleaning_tools') {
      return {
        title: '요구사항 추가',
        subtitle: '청소도구 준비',
        desc: (
          <>
            <div>청소도구 준비 서비스는 20,000원이 추가됩니다.</div>
            <div>청소도구가 없는 경우에만 선택해주세요.</div>
          </>
        ),
        actions: [
          { label: '확인', color: 'green', onClick: () => setServiceModal({ open: false, type: null }) },
        ],
      };
    }
    return null;
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
        </div>

        {/* 주택 정보 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">주택 정보</h3>

          {/* 주택 유형 */}
          <div className="flex gap-2">
            {Object.entries(HOUSING_TYPES).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setForm(prev => ({ ...prev, housingType: key as any }))}
                className={`flex-1 py-2 px-4 rounded-full border ${
                  form.housingType === key
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 평수 */}
          <div className="flex gap-2">
            {ROOM_SIZES.map(size => (
              <button
                key={size.id}
                onClick={() => setForm(prev => ({ ...prev, roomSize: size.id }))}
                className={`flex-1 py-2 px-4 rounded-full border ${
                  form.roomSize === size.id
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>

          {/* 주택 상세 정보 */}
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="현관 비밀번호, 방 갯수 등등"
            value={form.housingInformation}
            onChange={(e) => setForm(prev => ({ ...prev, housingInformation: e.target.value }))}
          />
        </div>

        {/* 날짜 및 시간 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">날짜 및 시간</h3>
          <p className="text-sm text-gray-500">서비스를 원하는 날짜와 시간을 선택해주세요</p>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="date"
              className="p-3 border border-gray-300 rounded-lg"
              value={form.reservationDate}
              min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
              onChange={(e) => setForm(prev => ({ ...prev, reservationDate: e.target.value }))}
            />
            <select
              className="p-3 border border-gray-300 rounded-lg"
              value={form.startTime}
              onChange={(e) => setForm(prev => ({ ...prev, startTime: e.target.value }))}
            >
              {Array.from({ length: 32 }).map((_, i) => {
                const hour = 6 + Math.floor(i / 2); // 6시부터 시작
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

            <select
              className="p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-400"
              value={form.endTime}
              disabled
            >
              <option>{form.endTime}</option>
            </select>
          </div>
        </div>

        {/* 서비스 추가 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">서비스 추가</h3>
          <div className="flex flex-wrap gap-2">
            {SERVICE_OPTIONS.map(service => (
              <button
                key={service.id}
                onClick={() => handleServiceToggle(service.id)}
                className={`py-2 px-4 rounded-full border ${
                  selectedServices.includes(service.id)
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {service.label}
                {service.timeAdd > 0 && (
                  <span className="ml-1 text-sm">
                    (+{service.timeAdd}분)
                  </span>
                )}
              </button>
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
                      setForm(prev => ({ ...prev, managerUuId: manager.uuid }));
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

        {/* 가격 표시 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">총 금액</span>
            <span className="text-xl font-bold text-orange-500">
              {totalPrice.toLocaleString()}원
            </span>
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

        {/* 서비스 안내 모달 */}
        {serviceModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center animate-fade-in">
              <div className="text-xl font-bold mb-2">{getServiceModalContent(serviceModal.type)?.title}</div>
              <div className="text-lg font-semibold mb-4">{getServiceModalContent(serviceModal.type)?.subtitle}</div>
              <div className="text-gray-700 text-center mb-6 space-y-1">{getServiceModalContent(serviceModal.type)?.desc}</div>
              <div className="flex gap-4 w-full">
                {getServiceModalContent(serviceModal.type)?.actions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={action.onClick}
                    className={`flex-1 py-3 rounded-lg font-bold text-lg ${
                      action.color === 'green' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-900'
                    } hover:opacity-80`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 반려동물 모달 */}
        {petModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col animate-fade-in">
              <div className="text-xl font-bold mb-2 text-center">애완동물 추가</div>
              <div className="text-gray-600 text-center mb-4">강아지나 고양이에 알레르기가 있는 도우미를 피할 수 있도록 알려주세요.</div>
              <div className="flex gap-6 justify-center mb-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={petType.dog} onChange={e => setPetType(pt => ({ ...pt, dog: e.target.checked }))} />
                  <span>개</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={petType.cat} onChange={e => setPetType(pt => ({ ...pt, cat: e.target.checked }))} />
                  <span>고양이</span>
                </label>
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="기타 (예: 토끼, 햄스터 등)"
                  value={petType.etc}
                  onChange={e => setPetType(pt => ({ ...pt, etc: e.target.value }))}
                />
              </div>
              <button
                onClick={handlePetSave}
                className="w-full py-3 bg-green-100 text-green-600 rounded-lg font-bold text-lg hover:opacity-80"
              >
                저장
              </button>
              <button
                onClick={() => setPetModal(false)}
                className="w-full mt-2 py-2 bg-gray-100 text-gray-700 rounded-lg hover:opacity-80"
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
