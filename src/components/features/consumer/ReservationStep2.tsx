// src/components/features/consumer/ReservationStep2.tsx
import React, { useState } from 'react';
import type { ReservationFormData, HousingType, PetType } from '@/types/reservation';
import { useMatching } from '@/hooks/useMatching';

interface Props {
  initialData: Partial<ReservationFormData>;
  onBack: () => void;
  onSubmit: (form: ReservationFormData) => void;
}

const ReservationStep2: React.FC<Props> = ({ initialData, onBack, onSubmit }) => {
  const [form, setForm] = useState<ReservationFormData>({
    serviceType: initialData.serviceType || '',
    serviceDetailType: initialData.serviceDetailType || '',
    address: '',
    addressDetail: '',
    housingType: 'APT',
    roomSize: 10,
    housingInformation: '',
    reservationDate: '',
    startTime: '',
    endTime: '',
    serviceAdd: '',
    pet: 'NONE',
    specialRequest: '',
    chooseManager: false,
  });

  const [managerList, setManagerList] = useState<any[]>([]);
  const [showManagerSelection, setShowManagerSelection] = useState(false);
  const [showPetModal, setShowPetModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const { fetchAvailableManagers } = useMatching();

  const handleChange = (name: keyof ReservationFormData, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceAdd = (value: string) => {
    if (value === '요리') {
      setShowServiceModal(true);
    } else if (value === '반려동물 청소') {
      setShowPetModal(true);
    } else {
      setForm((prev) => ({ ...prev, serviceAdd: value }));
    }
  };

  const handleSubmit = () => {
    onSubmit(form);
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
        setManagerList(result);
        setShowManagerSelection(true);
      } else {
        alert('매니저 불러오기 실패');
      }
    } catch (e) {
      alert('매니저 조회 중 오류 발생');
    }
  };

  const handleSelectManager = (uuid: string) => {
    handleChange('managerUuId', uuid);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">예약 정보 입력</h2>

      {/* 주소 입력 */}
      <div>
        <label className="block font-semibold">주소 입력</label>
        <input
          className="border p-2 w-full"
          placeholder="주소를 입력하세요"
          value={form.address}
          onChange={(e) => handleChange('address', e.target.value)}
        />
        <input
          className="border p-2 w-full mt-1"
          placeholder="상세 주소 입력"
          value={form.addressDetail}
          onChange={(e) => handleChange('addressDetail', e.target.value)}
        />
      </div>

      {/* 주거 정보 */}
      <div>
        <label className="block font-semibold">주거 형태</label>
        <select
          className="border p-2 w-full"
          value={form.housingType}
          onChange={(e) => handleChange('housingType', e.target.value as HousingType)}
        >
          <option value="APT">아파트</option>
          <option value="VILLA">빌라</option>
          <option value="HOUSE">주택</option>
          <option value="OFFICETEL">오피스텔</option>
        </select>

        <label className="block font-semibold mt-2">평수 선택</label>
        <select
          className="border p-2 w-full"
          value={form.roomSize}
          onChange={(e) => handleChange('roomSize', Number(e.target.value))}
        >
          <option value={10}>10평 이하</option>
          <option value={20}>20평대</option>
          <option value={30}>30평대</option>
        </select>
      </div>
      <div>
        <label className="block font-semibold">주택 정보</label>
        <input
          className="border p-2 w-full"
          placeholder="예: 현관 비밀번호, 방 갯수 등"
          value={form.housingInformation}
          onChange={(e) => handleChange('housingInformation', e.target.value)}
        />
      </div>

      {/* 날짜 및 시간 */}
      <div>
        <label className="block font-semibold">서비스 날짜</label>
        <input
          type="date"
          className="border p-2 w-full"
          value={form.reservationDate}
          onChange={(e) => handleChange('reservationDate', e.target.value)}
        />

        <label className="block font-semibold mt-2">시작 시간</label>
        <input
          type="time"
          className="border p-2 w-full"
          value={form.startTime}
          onChange={(e) => handleChange('startTime', e.target.value)}
        />

        <label className="block font-semibold mt-2">종료 시간</label>
        <input
          type="time"
          className="border p-2 w-full"
          value={form.endTime}
          onChange={(e) => handleChange('endTime', e.target.value)}
        />
      </div>

      {/* 서비스 추가 */}
      <div>
        <label className="block font-semibold">서비스 추가</label>
        <div className="flex gap-2 mt-1">
          {['청소', '세탁', '요리', '반려동물 청소'].map((service) => (
            <button
              key={service}
              className={`px-3 py-1 border rounded-full ${form.serviceAdd === service ? 'bg-orange-500 text-white' : 'bg-white'}`}
              onClick={() => handleServiceAdd(service)}
            >
              {service}
            </button>
          ))}
        </div>
      </div>

      {/* 매니저 직접 선택 */}
      <div>
        <label className="block font-semibold">매니저 직접 선택</label>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.chooseManager}
            onChange={(e) => handleChange('chooseManager', e.target.checked)}
          />
          <span>매니저 선택</span>
          {form.chooseManager && (
            <button onClick={handleManagerSelect} className="ml-2 px-3 py-1 bg-orange-500 text-white rounded">
              선택하기
            </button>
          )}
        </div>

        {showManagerSelection && (
          <div className="mt-2 border p-2 rounded">
            <p className="font-semibold mb-2">선택 가능한 매니저</p>
            {managerList.map((manager) => (
              <div
                key={manager.uuid}
                className={`p-2 border rounded mb-2 ${form.managerUuId === manager.uuid ? 'bg-orange-100' : ''}`}
              >
                <p className="font-medium">{manager.name}</p>
                <button
                  onClick={() => handleSelectManager(manager.uuid)}
                  className="mt-1 px-3 py-1 bg-blue-500 text-white rounded"
                >
                  선택
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 요청사항 */}
      <div>
        <label className="block font-semibold">요청사항</label>
        <textarea
          className="border p-2 w-full"
          placeholder="요청사항을 입력하세요"
          value={form.specialRequest}
          onChange={(e) => handleChange('specialRequest', e.target.value)}
        />
      </div>

      {/* 모달: 요리 선택 */}
      {showServiceModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded shadow w-96">
            <h3 className="text-lg font-semibold mb-2">요리 선택</h3>
            <select className="w-full border p-2 mb-4" onChange={(e) => handleChange('serviceAdd', e.target.value)}>
              <option value="요리-한식">한식</option>
              <option value="요리-중식">중식</option>
              <option value="요리-일식">일식</option>
              <option value="요리-양식">양식</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowServiceModal(false)} className="px-4 py-1 bg-gray-300 rounded">취소</button>
              <button onClick={() => setShowServiceModal(false)} className="px-4 py-1 bg-orange-500 text-white rounded">확인</button>
            </div>
          </div>
        </div>
      )}

      {/* 모달: 반려동물 선택 */}
      {showPetModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded shadow w-96">
            <h3 className="text-lg font-semibold mb-2">반려동물 종류</h3>
            <select className="w-full border p-2 mb-4" onChange={(e) => handleChange('pet', e.target.value as PetType)}>
              <option value="DOG">강아지</option>
              <option value="CAT">고양이</option>
              <option value="BIRD">새</option>
              <option value="ETC">기타</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowPetModal(false)} className="px-4 py-1 bg-gray-300 rounded">취소</button>
              <button onClick={() => setShowPetModal(false)} className="px-4 py-1 bg-orange-500 text-white rounded">확인</button>
            </div>
          </div>
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="flex justify-between">
        <button onClick={onBack} className="px-4 py-2 bg-gray-300 rounded">이전</button>
        <button onClick={handleSubmit} className="px-4 py-2 bg-orange-500 text-white rounded">
          다음
        </button>
      </div>
    </div>
  );
};

export default ReservationStep2;
