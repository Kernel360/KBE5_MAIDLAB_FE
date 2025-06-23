import React, { useState, useEffect } from 'react';
import type { ReservationFormData } from '@/types/reservation';
import { useReservation } from '@/hooks/domain/useReservation';
import { useNavigate } from 'react-router-dom';
import {
  SERVICE_DETAIL_TYPES,
  HOUSING_TYPES,
  ROOM_SIZES,
  SERVICE_OPTIONS,
  PET_TYPES,
} from '@/constants/service';
import {ROUTES} from '@/constants'
import ReservationHeader from './ReservationHeader';

interface Props {
  data: ReservationFormData;
  onBack: () => void;
  onSubmit: () => void;
}

const getPetDisplay = (pet: string) => {
  if (!pet || pet === 'NONE') return '없음';
  return pet
    .split(',')
    .map((p) => {
      if (p === 'DOG') return PET_TYPES.DOG;
      if (p === 'CAT') return PET_TYPES.CAT;
      if (p === 'NONE') return PET_TYPES.NONE;
      return p;
    })
    .join(', ');
};

const ReservationStep3: React.FC<Props> = ({ data, onBack, onSubmit }) => {
  const [expectedPrice, setExpectedPrice] = useState(0);
  const { createReservation } = useReservation();
  const navigate = useNavigate();

  useEffect(() => {
    const calculatePrice = async () => {
      const serviceDetailType = data.serviceDetailType || '대청소';
      const serviceDetail = SERVICE_DETAIL_TYPES[serviceDetailType];
      if (!serviceDetail) return;
      const basePrice = serviceDetail.basePrice;
      let additionalPrice = 0;
      if (data.serviceAdd) {
        const services = data.serviceAdd.split(',');
        if (services.includes('cooking')) additionalPrice += 10000;
        if (services.includes('ironing')) additionalPrice += 10000;
      }
      setExpectedPrice(basePrice + additionalPrice);
    };
    calculatePrice();
  }, [data]);

  const serviceDetail =
    SERVICE_DETAIL_TYPES[data.serviceDetailType || '대청소'];
  // int -> BigDecimal
  const toBigDecimal = (price: number) => `${price}.00`;

  // 예약 등록 핸들러
  const handleSubmit = async () => {
    if (!data.managerUuId) {
      alert('매니저 정보가 없습니다.');
      return;
    }
    if (!serviceDetail) {
      alert('서비스 종류 정보가 올바르지 않습니다.');
      return;
    }
    const reservationPayload = {
      serviceDetailTypeId: serviceDetail.id,
      address: data.address,
      addressDetail: data.addressDetail,
      managerUuId: data.managerUuId,
      housingType: data.housingType,
      roomSize: data.roomSize,
      housingInformation: data.housingInformation,
      reservationDate: data.reservationDate,
      startTime: data.startTime,
      endTime: data.endTime,
      serviceAdd: data.serviceAdd,
      pet: data.pet,
      specialRequest: data.specialRequest,
      totalPrice: toBigDecimal(expectedPrice),
    };
    try {
      const result = await createReservation(reservationPayload);
      if (result.success) {
        alert('예약이 완료되었습니다.');
        onSubmit();
        navigate(ROUTES.HOME);
      } else {
        alert('예약 요청 실패: ' + (result.error || '오류'));
      }
    } catch (e) {
      alert('서버 오류 발생');
    }
  };

  return (
    <>
      <ReservationHeader title="예약 정보 확인" onBack={onBack} />
      <div className="pt-16 p-4 space-y-6 max-w-lg mx-auto">
        {/* 주소 입력 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">주소 입력</h3>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-100"
              value={data.address}
              readOnly
              disabled
            />
          </div>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
            value={data.addressDetail}
            readOnly
            disabled
          />
        </div>

        {/* 주택 정보 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">주택 정보</h3>
          <div className="flex gap-2">
            {Object.entries(HOUSING_TYPES).map(([key, label]) => (
              <button
                key={key}
                className={`flex-1 py-2 px-4 rounded-full border ${
                  data.housingType === key
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-400 border-gray-200'
                }`}
                disabled
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {ROOM_SIZES.map((size) => (
              <button
                key={size.id}
                className={`flex-1 py-2 px-4 rounded-full border ${
                  data.roomSize === size.id
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-400 border-gray-200'
                }`}
                disabled
              >
                {size.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
            value={data.housingInformation}
            readOnly
            disabled
          />
        </div>

        {/* 날짜 및 시간 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">날짜 및 시간</h3>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="date"
              className="p-3 border border-gray-300 rounded-lg bg-gray-100"
              value={data.reservationDate}
              readOnly
              disabled
            />
            <input
              type="text"
              className="p-3 border border-gray-300 rounded-lg bg-gray-100"
              value={data.startTime}
              readOnly
              disabled
            />
            <input
              type="text"
              className="p-3 border border-gray-300 rounded-lg bg-gray-100"
              value={data.endTime}
              readOnly
              disabled
            />
          </div>
        </div>

        {/* 서비스 추가 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">서비스 추가</h3>
          <div className="flex flex-wrap gap-2">
            {SERVICE_OPTIONS.map((service) => (
              <button
                key={service.id}
                className={`py-2 px-4 rounded-full border ${
                  data.serviceAdd?.split(',').includes(service.id)
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-400 border-gray-200'
                }`}
                disabled
              >
                {service.label}
                {service.timeAdd > 0 && (
                  <span className="ml-1 text-sm">(+{service.timeAdd}분)</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 반려동물 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">특이 사항</h3>
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
            <span>반려동물</span>
            <span className="text-gray-700 font-semibold">
              {getPetDisplay(data.pet)}
            </span>
          </div>
        </div>

        {/* 결제 정보 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">총 금액</span>
            <span className="text-xl font-bold text-orange-500">
              {expectedPrice.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-4 mt-8 pb-8">
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
            예약 완료
          </button>
        </div>
      </div>
    </>
  );
};

export default ReservationStep3;
