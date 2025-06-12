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
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">예약 확인</h2>

      <div className="border p-4 rounded space-y-2">
        <p><strong>주소:</strong> {data.address} {data.addressDetail}</p>
        <p><strong>주거 형태:</strong> {data.housingType}, {data.roomSize}평</p>
        <p><strong>서비스 종류:</strong> {serviceDetail.name}</p>
        <p><strong>서비스 날짜:</strong> {data.reservationDate}</p>
        <p><strong>시간:</strong> {data.startTime} ~ {data.endTime}</p>
        <p><strong>서비스 추가:</strong> {displayServiceAdd || '없음'}</p>
        <p><strong>반려동물:</strong> {data.pet}</p>
        <p><strong>요청사항:</strong> {data.specialRequest || '없음'}</p>
        <p><strong>기타 정보:</strong> {data.housingInformation}</p>
      </div>

      <div className="border p-4 rounded space-y-2">
        <h3 className="font-semibold">결제 요약</h3>
        <p>기본 서비스 ({serviceDetail.name}): {serviceDetail.price.toLocaleString()}원</p>
        {data.serviceAdd?.includes('요리') && <p>요리 추가: 20,000원</p>}
        {data.serviceAdd?.includes('청소도구') && <p>청소도구 준비: 10,000원</p>}
        {additionalPrice > 0 && <p>추가 서비스 총액: {additionalPrice.toLocaleString()}원</p>}
        <p className="font-bold">총 결제 금액: {expectedPrice.toLocaleString()}원</p>
      </div>

      <button onClick={handleSubmit} className="px-4 py-2 bg-orange-500 text-white rounded">
        예약 완료
      </button>

      <div>
        <button onClick={onBack} className="mt-2 px-4 py-2 bg-gray-300 rounded">이전</button>
      </div>
    </div>
  );
};

export default ReservationStep3;
