import React, { useState } from 'react';

interface Props {
  onNext: (data: { serviceType: string; serviceDetailType: string }) => void;
}

const ReservationStep1: React.FC<Props> = ({ onNext }) => {
  const [serviceType, setServiceType] = useState('');
  const [serviceDetailType, setServiceDetailType] = useState('');

  const handleNext = () => {
    if (!serviceType || !serviceDetailType) {
      alert('서비스 유형과 상세 유형을 모두 선택해주세요.');
      return;
    }
    onNext({ serviceType, serviceDetailType });
  };

  return (
    <div>
      <h2>서비스 선택</h2>

      <div>
        <label>서비스 유형</label>
        <select value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
          <option value="">선택</option>
          <option value="HOUSEKEEPING">가사 서비스</option>
          <option value="CARE">간병 서비스</option>
        </select>
      </div>

      <div>
        <label>상세 서비스 유형</label>
        <select value={serviceDetailType} onChange={(e) => setServiceDetailType(e.target.value)}>
          <option value="">선택</option>
          {/* 실제 서비스 유형에 따라 옵션 필터링 가능 */}
          <option value="CLEANING">청소</option>
          <option value="WASHING">세탁</option>
          <option value="ELDERLY_CARE">노인 간병</option>
        </select>
      </div>

      <button onClick={handleNext}>다음</button>
    </div>
  );
};

export default ReservationStep1;
