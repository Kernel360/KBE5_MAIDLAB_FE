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
  ROOM_SIZES_LIFE_CLEANING,
} from '@/constants/service';
import {ROUTES} from '@/constants'
import ReservationHeader from './ReservationHeader';
import { CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';
import { format, addDays } from 'date-fns';

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

    };
    calculatePrice();
  }, [data]);

  const serviceDetail =
    SERVICE_DETAIL_TYPES[data.serviceDetailType || '대청소'];
  // int -> BigDecimal
  const toBigDecimal = (price: number) => `${price}.00`;

  // 금액 계산 함수 (Step2와 동일하게)
  const getLifeCleaningInfo = () => {
    if (data.serviceDetailType !== '생활청소') return null;
    // lifeCleaningRoomIdx가 undefined일 경우 0으로 처리
    return ROOM_SIZES_LIFE_CLEANING[data.lifeCleaningRoomIdx ?? 0];
  };

  const calculateTotalTimeAndPrice = () => {
    const baseInfo = getLifeCleaningInfo();
    if (!baseInfo) return { totalTime: 0, totalPrice: 0 };

    let additionalTime = 0;
    let additionalPrice = 0;

    (data.serviceOptions || []).forEach(opt => {
      const service = SERVICE_OPTIONS.find(s => s.id === opt.id);
      if (service) {
        const count = service.countable ? (opt.count || 1) : 1;
        additionalTime += service.timeAdd * count;
        additionalPrice += service.priceAdd * count;
      }
    });

    const totalTime = baseInfo.baseTime * 60 + additionalTime;
    const totalPrice = baseInfo.estimatedPrice + additionalPrice;
    return { totalTime, totalPrice, basePrice: baseInfo.estimatedPrice, additionalPrice };
  };

  const { totalTime, totalPrice, basePrice, additionalPrice } = calculateTotalTimeAndPrice();

  // 종료 시간 계산 함수
  const getExpectedEndTime = () => {
    const [startHour, startMinute] = (data.startTime || '09:00').split(':').map(Number);
    const totalMinutes = startHour * 60 + startMinute + totalTime;
    const endHour = Math.floor(totalMinutes / 60) % 24;
    const endMinute = totalMinutes % 60;
    return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
  };

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
      lifeCleaningRoomIdx: data.lifeCleaningRoomIdx,
      housingInformation: data.housingInformation,
      reservationDate: data.reservationDate,
      startTime: data.startTime,
      endTime: data.endTime,
      serviceOptions: data.serviceOptions,
      pet: data.pet,
      specialRequest: data.specialRequest,
      totalPrice: toBigDecimal(totalPrice),
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
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg mt-2 bg-gray-100"
            value={data.housingInformation}
            readOnly
            disabled
            placeholder="현관 비밀번호 등 (선택)"
          />
        </div>

        {/* 주택 정보 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">주택 유형</h3>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(HOUSING_TYPES).map(([key, label]) => (
              <button
                key={key}
                className={`flex items-center justify-center py-3 rounded-lg border-2 shadow-sm transition-all text-base font-semibold
                  ${data.housingType === key ? 'bg-orange-500 text-white border-orange-500 scale-105' : 'bg-white text-gray-400 border-gray-200'}`}
                disabled
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 날짜 및 시간 */}
        <div className="rounded-2xl shadow-lg bg-white p-6 border border-orange-100">
          <div className="flex items-center gap-3 mb-2">
            <CalendarDaysIcon className="w-7 h-7 text-orange-500" />
            <h3 className="text-xl font-bold text-orange-600">예약 날짜 및 시간</h3>
          </div>
          <div className="text-gray-500 text-sm mb-4">예약 날짜와 시작 시간을 확인하세요.</div>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <label className="block text-gray-700 font-medium mb-1">날짜</label>
              <input
                type="text"
                className="w-full p-3 border-2 border-orange-200 rounded-lg bg-gray-100 text-center text-lg font-semibold"
                value={data.reservationDate}
                readOnly
                disabled
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-gray-700 font-medium mb-1">시작 시간</label>
              <div className="relative">
                <ClockIcon className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-orange-400" />
                <input
                  type="text"
                  className="w-full p-3 pl-8 border-2 border-orange-200 rounded-lg bg-gray-100 text-center text-lg font-semibold"
                  value={data.startTime}
                  readOnly
                  disabled
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-col items-center justify-center">
            <div className="text-gray-700 text-base font-semibold">
              선택한 날짜: <span className="text-orange-600 font-bold">{data.reservationDate}</span>
            </div>
            <div className="text-gray-700 text-base font-semibold mt-1">
              시작 시간: <span className="text-orange-600 font-bold">{data.startTime || '선택 전'}</span>
            </div>
            <div className="text-orange-500 text-base font-bold mt-1">
              예상 종료 시간: {getExpectedEndTime()}
            </div>
            <div className="text-gray-400 text-sm mt-1">(종료 시간은 서비스/옵션에 따라 자동 계산됩니다)</div>
          </div>
        </div>

        {/* 서비스 추가 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">서비스 추가</h3>
          <div className="space-y-2">
            {(data.serviceOptions || []).length === 0 && (
              <div className="text-gray-400 text-center">선택된 추가 서비스가 없습니다.</div>
            )}
            {(data.serviceOptions || []).map(opt => {
              const service = SERVICE_OPTIONS.find(s => s.id === opt.id);
              if (!service) return null;
              const count = service.countable ? (opt.count || 1) : 1;
              // 설명 자동 생성
              let desc = '';
              if (service.countable) {
                desc = `개당 ${service.timeAdd}분, ${service.priceAdd.toLocaleString()}원 추가됩니다.`;
              } else {
                desc = `${service.timeAdd >= 60 ? `${service.timeAdd / 60}시간` : `${service.timeAdd}분`}, ${service.priceAdd.toLocaleString()}원 추가됩니다.`;
              }
              return (
                <div key={opt.id} className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border rounded-lg bg-white shadow-sm">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{service.label}{service.countable ? ` x${count}` : ''}</div>
                    <div className="text-sm text-gray-500 mt-1">{desc}</div>
                  </div>
                  <div className="flex flex-col items-end mt-2 md:mt-0">
                    <span className="text-orange-500 font-bold">+{(service.priceAdd * count).toLocaleString()}원</span>
                    <span className="text-xs text-gray-400">+{service.timeAdd * count}분</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 반려동물 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">특이 사항</h3>
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
            <span>반려동물 유무</span>
            <span className="font-semibold text-gray-700">{getPetDisplay(data.pet as string)}</span>
          </div>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg mt-2 bg-gray-100"
            value={data.specialRequest}
            readOnly
            disabled
            placeholder="매니저가 알아야 할 특이사항 (예: 집 구조, 주의사항 등)"
          />
        </div>

        {/* 매니저 정보 카드 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">담당 매니저</h3>
          {data.managerInfo ? (
            <div className="flex items-center gap-4 p-4 border rounded-xl bg-white shadow-sm">
              <img src={data.managerInfo.profileImage || '/default-profile.png'} alt="프로필" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-lg truncate">{data.managerInfo.name}</span>
                  {data.managerInfo.averageRate && <span className="text-orange-500 font-bold text-sm">★ {data.managerInfo.averageRate}</span>}
                </div>
                <div className="text-gray-600 text-sm truncate">{data.managerInfo.introduceText || '소개 정보 없음'}</div>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-center">자동 배정 예정</div>
          )}
        </div>

        {/* 결제 정보 */}
        <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-100">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-gray-600">
              <span>기본 요금</span>
              <span>{basePrice ? basePrice.toLocaleString() : 0}원</span>
            </div>
            {/* 추가 서비스별 금액 상세 */}
            <div className="space-y-1">
              {(data.serviceOptions || []).map(opt => {
                const service = SERVICE_OPTIONS.find(s => s.id === opt.id);
                if (!service) return null;
                const count = service.countable ? (opt.count || 1) : 1;
                return (
                  <div key={opt.id} className="flex justify-between items-center text-gray-600">
                    <span>{service.label}{service.countable ? ` x${count}` : ''}</span>
                    <span>+{(service.priceAdd * count).toLocaleString()}원</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-orange-200 pt-2 flex justify-between items-center">
              <span className="font-medium">총 금액</span>
              <span className="text-xl font-bold text-orange-500">
                {totalPrice.toLocaleString()}원
              </span>
            </div>
            <div className="text-sm text-gray-500 text-center mt-2">
              예상 소요 시간: {Math.floor(totalTime / 60)}시간 {totalTime % 60}분
            </div>
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
