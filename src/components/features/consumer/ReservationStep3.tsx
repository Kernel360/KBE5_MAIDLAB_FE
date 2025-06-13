import React, { useState, useEffect } from 'react';
import type { ReservationFormData } from '@/types/reservation';
import { useReservation } from '@/hooks/useReservation';
import { useMatching } from '@/hooks/useMatching';
import { SERVICE_DETAIL_TYPES } from '@/constants/service';

interface Props {
  data: ReservationFormData;
  onBack: () => void;
  onSubmit: () => void;
}

// int -> BigDecimal
const toBigDecimal = (price: number) => `${price}.00`;

// 추가 서비스 가격 계산
const calculateAdditionalPrice = (serviceAdd: string[] | string | undefined): number => {
  if (!serviceAdd) return 0;
  const services = Array.isArray(serviceAdd) ? serviceAdd : serviceAdd.split(',');
  let additionalPrice = 0;
  if (services.includes('요리')) additionalPrice += 20000;
  if (services.includes('청소도구')) additionalPrice += 10000;
  if (services.includes('다림질')) additionalPrice += 10000;
  return additionalPrice;
};

const ReservationStep3: React.FC<Props> = ({ data, onBack, onSubmit }) => {
  const [expectedPrice, setExpectedPrice] = useState(0);
  const { createReservation } = useReservation();
  const { fetchAvailableManagers } = useMatching();

  useEffect(() => {
    const calculatePrice = async () => {
      // 기본 서비스 가격
      const serviceDetailType = data.serviceDetailType || '대청소';
      const serviceDetail = SERVICE_DETAIL_TYPES[serviceDetailType];

      if (!serviceDetail) {
        console.error('서비스 종류를 찾을 수 없음:', serviceDetailType);
        return;
      }

      const basePrice = serviceDetail.price;
      
      // 추가 서비스 가격 계산
      const additionalPrice = calculateAdditionalPrice(data.serviceAdd);
      
      setExpectedPrice(basePrice + additionalPrice);

      // 매니저를 선택하지 않은 경우 첫 번째 매니저 자동 선택
      if (!data.managerUuId && !data.chooseManager) {
        try {
          const request = {
            address: data.address,
            startTime: data.startTime,
            endTime: data.endTime,
            managerChoose: false,
          };

          const managers = await fetchAvailableManagers(request);
          if (Array.isArray(managers) && managers.length > 0) {
            data.managerUuId = managers[0].uuid;
          }
        } catch (e) {
          console.error('매니저 조회 실패:', e);
        }
      }
    };

    calculatePrice();
  }, [data, fetchAvailableManagers]);

  const handleSubmit = async () => {
    if (!data.managerUuId) {
      alert('매니저 정보를 불러오는 중 오류가 발생했습니다.');
      return;
    }

    // serviceDetailType이 없는 경우 기본값으로 '대청소' 설정
    const serviceDetailType = data.serviceDetailType || '대청소';
    const serviceDetail = SERVICE_DETAIL_TYPES[serviceDetailType];
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
      serviceAdd: Array.isArray(data.serviceAdd) ? data.serviceAdd.join(',') : (data.serviceAdd || ''),
      pet: data.pet,
      specialRequest: data.specialRequest,
      totalPrice: toBigDecimal(expectedPrice),
    };

    console.log('예약 데이터:', {
      서비스종류: serviceDetail.name,
      서비스ID: serviceDetail.id,
      기본가격: serviceDetail.price,
      추가서비스: data.serviceAdd,
      추가가격: calculateAdditionalPrice(data.serviceAdd),
      총가격: expectedPrice,
      전체데이터: reservationPayload
    });

    try {
      const result = await createReservation(reservationPayload);
      if (result.success) {
        alert('예약이 완료되었습니다.');
        onSubmit();
      } else {
        alert('예약 요청 실패: ' + result.error);
      }
    } catch (e) {
      alert('서버 오류 발생');
    }
  };

  const displayServiceAdd = Array.isArray(data.serviceAdd) 
    ? data.serviceAdd.join(', ') 
    : data.serviceAdd;

  const serviceDetail = SERVICE_DETAIL_TYPES[data.serviceDetailType || '대청소'];
  const additionalPrice = calculateAdditionalPrice(data.serviceAdd);

  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-center">예약 정보 확인</h2>

      {/* 예약 정보 카드 */}
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-orange-500 text-lg">🏠</span>
            <span className="font-semibold">주소</span>
            <span className="text-gray-700">{data.address} {data.addressDetail}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-500 text-lg">🏢</span>
            <span className="font-semibold">주거 형태</span>
            <span className="text-gray-700">{data.housingType}, {data.roomSize}평</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-500 text-lg">🧹</span>
            <span className="font-semibold">서비스 종류</span>
            <span className="text-gray-700">{serviceDetail.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-500 text-lg">📅</span>
            <span className="font-semibold">서비스 날짜</span>
            <span className="text-gray-700">{data.reservationDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-500 text-lg">⏰</span>
            <span className="font-semibold">시간</span>
            <span className="text-gray-700">{data.startTime} ~ {data.endTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-500 text-lg">➕</span>
            <span className="font-semibold">서비스 추가</span>
            <span className="text-gray-700">{displayServiceAdd || '없음'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-500 text-lg">🐾</span>
            <span className="font-semibold">반려동물</span>
            <span className="text-gray-700">{data.pet === 'NONE' ? '없음' : data.pet}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-500 text-lg">📝</span>
            <span className="font-semibold">요청사항</span>
            <span className="text-gray-700">{data.specialRequest || '없음'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-500 text-lg">ℹ️</span>
            <span className="font-semibold">기타 정보</span>
            <span className="text-gray-700">{data.housingInformation}</span>
          </div>
        </div>
      </div>

      {/* 결제 정보 카드 */}
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">결제 요약</h3>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">기본 서비스 ({serviceDetail.name})</span>
            <span className="font-semibold">{serviceDetail.price.toLocaleString()}원</span>
          </div>
          {displayServiceAdd?.includes('요리') && (
            <div className="flex justify-between items-center">
              <span className="text-gray-700">요리 추가</span>
              <span className="font-semibold">20,000원</span>
            </div>
          )}
          {displayServiceAdd?.includes('다림질') && (
            <div className="flex justify-between items-center">
              <span className="text-gray-700">다림질 추가</span>
              <span className="font-semibold">10,000원</span>
            </div>
          )}
          {displayServiceAdd?.includes('청소도구') && (
            <div className="flex justify-between items-center">
              <span className="text-gray-700">청소도구 준비</span>
              <span className="font-semibold">10,000원</span>
            </div>
          )}
          {additionalPrice > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500">추가 서비스 총액</span>
              <span className="font-semibold">{additionalPrice.toLocaleString()}원</span>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center mt-4 p-4 rounded-xl bg-orange-50">
          <span className="text-lg font-bold text-orange-600">총 결제 금액</span>
          <span className="text-2xl font-extrabold text-orange-600">{expectedPrice.toLocaleString()}원</span>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="fixed left-0 right-0 bottom-0 bg-white p-4 flex gap-4 shadow-t z-10">
        <button
          onClick={onBack}
          className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold"
        >
          이전
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-bold"
        >
          예약 완료
        </button>
      </div>
    </div>
  );
};

export default ReservationStep3;
