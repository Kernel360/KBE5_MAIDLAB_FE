import React, { useState, useEffect } from 'react';
import type { ReservationFormData } from '@/types/reservation';
import { useReservation } from '@/hooks/useReservation';

interface Props {
  data: ReservationFormData;
  onBack: () => void;
  onComplete: (finalData: ReservationFormData) => void;
}

// LocalDate + LocalTime → LocalDateTime 문자열
const toLocalDateTime = (date: string, time: string) => `${date}T${time}:00`;

const ReservationStep3: React.FC<Props> = ({ data, onBack, onComplete }) => {
  const [expectedPrice, setExpectedPrice] = useState(0);
  const [priceVerified, setPriceVerified] = useState(false);
  const { checkPrice, createReservation } = useReservation();

  useEffect(() => {
    let price = 180000;
    if (data.serviceAdd?.includes('요리')) price += 60000;
    if (data.serviceAdd?.includes('청소도구')) price += 30000;
    setExpectedPrice(price);
  }, [data]);

  const handleVerifyPrice = async () => {
    try {
      const payload = {
        serviceDetailTypeId: 1,
        address: data.address,
        addressDetail: data.addressDetail,
        managerUuId: data.managerUuId,
        housingType: data.housingType,
        roomSize: data.roomSize,
        housingInformation: data.housingInformation,
        reservationDate: toLocalDateTime(data.reservationDate, data.startTime),
        startTime: toLocalDateTime(data.reservationDate, data.startTime),
        endTime: toLocalDateTime(data.reservationDate, data.endTime),
        serviceAdd: data.serviceAdd,
        pet: data.pet,
        specialRequest: data.specialRequest,
        totalPrice: expectedPrice,
      };

      const result = await checkPrice(payload);
      if (result.success && result.data === String(expectedPrice)) {
        setPriceVerified(true);
      } else {
        alert('결제 금액 불일치 또는 오류');
      }
    } catch (err) {
      alert('가격 검증 중 오류 발생');
    }
  };

  const handleSubmit = async () => {
    const reservationPayload = {
      serviceDetailTypeId: 1,
      address: data.address,
      addressDetail: data.addressDetail,
      managerUuId: data.managerUuId,
      housingType: data.housingType,
      roomSize: data.roomSize,
      housingInformation: data.housingInformation,
      reservationDate: toLocalDateTime(data.reservationDate, data.startTime),
      startTime: toLocalDateTime(data.reservationDate, data.startTime),
      endTime: toLocalDateTime(data.reservationDate, data.endTime),
      serviceAdd: data.serviceAdd,
      pet: data.pet,
      specialRequest: data.specialRequest,
      totalPrice: expectedPrice,
    };

    try {
      const result = await createReservation(reservationPayload);
      if (result.success) {
        alert('예약이 완료되었습니다.');
        onComplete(data);
      } else {
        alert('예약 요청 실패: ' + result.error);
      }
    } catch (e) {
      alert('서버 오류 발생');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">예약 확인</h2>

      <div className="border p-4 rounded space-y-2">
        <p><strong>주소:</strong> {data.address} {data.addressDetail}</p>
        <p><strong>주거 형태:</strong> {data.housingType}, {data.roomSize}평</p>
        <p><strong>서비스 날짜:</strong> {data.reservationDate}</p>
        <p><strong>시간:</strong> {data.startTime} ~ {data.endTime}</p>
        <p><strong>서비스 추가:</strong> {data.serviceAdd?.join(', ')}</p>
        <p><strong>반려동물:</strong> {data.pet}</p>
        <p><strong>요청사항:</strong> {data.specialRequest}</p>
        <p><strong>기타 정보:</strong> {data.housingInformation}</p>
      </div>

      <div className="border p-4 rounded space-y-2">
        <h3 className="font-semibold">결제 요약</h3>
        <p>기본 서비스: 180,000 VND</p>
        {data.serviceAdd?.includes('요리') && <p>요리 추가: 60,000 VND</p>}
        {data.serviceAdd?.includes('청소도구') && <p>청소도구 준비: 30,000 VND</p>}
        <p className="font-bold">총 결제 금액: {expectedPrice.toLocaleString()} VND</p>
      </div>

      {!priceVerified ? (
        <button onClick={handleVerifyPrice} className="px-4 py-2 bg-blue-500 text-white rounded">
          금액 확인
        </button>
      ) : (
        <button onClick={handleSubmit} className="px-4 py-2 bg-orange-500 text-white rounded">
          예약 완료
        </button>
      )}

      <div>
        <button onClick={onBack} className="mt-2 px-4 py-2 bg-gray-300 rounded">이전</button>
      </div>
    </div>
  );
};

export default ReservationStep3;
