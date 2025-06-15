// src/components/features/consumer/ReservationStep1.tsx
import React, { useState } from 'react';

interface Props {
  onNext: (data: { serviceType: string; serviceDetailType: string }) => void;
}

const ReservationStep1: React.FC<Props> = ({ onNext }) => {
  const [selected, setSelected] = useState<'대청소' | '부분청소' | '기타 청소'>('대청소');

  const handleSelect = (type: '대청소' | '부분청소' | '기타 청소') => {
    if (type !== '대청소') {
      alert('서비스 준비중입니다.');
      return;
    }
    setSelected(type);
  };

  const handleNext = () => {
    onNext({ serviceType: 'HOUSEKEEPING', serviceDetailType: selected });
  };

  return (
    <div className="p-4 space-y-6 text-gray-800">
      <h2 className="text-lg font-bold border-b pb-2">가사 서비스를 선택하셨네요!</h2>
      <p className="text-sm">하위 옵션을 선택해 주세요.</p>

      <div className="flex space-x-2">
        {['대청소', '부분청소', '기타 청소'].map((type) => (
          <button
            key={type}
            onClick={() => handleSelect(type as any)}
            className={`flex-1 border rounded px-4 py-2 font-medium text-center ${
              selected === type
                ? 'border-orange-500 text-orange-500 bg-orange-50'
                : 'border-gray-300'
            }`}
            disabled={type !== '대청소'}
            style={type !== '대청소' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            {type}
          </button>
        ))}
      </div>

      <ul className="text-sm space-y-1 text-gray-600">
        <li className="before:content-['\2713'] before:text-blue-500 before:mr-2">
          소파 등 가구 먼지제거
        </li>
        <li className="before:content-['\2713'] before:text-blue-500 before:mr-2">
          바닥청소(물걸레 포함)
        </li>
        <li className="before:content-['\2713'] before:text-blue-500 before:mr-2">
          창문, 곰팡이 정리정돈
        </li>
        <li className="before:content-['\2713'] before:text-blue-500 before:mr-2">
          설치지 및 주변정리
        </li>
        <li className="before:content-['\2713'] before:text-blue-500 before:mr-2">
          일반/음식물/재활용 배출
        </li>
        <li className="before:content-['\2713'] before:text-blue-500 before:mr-2">
          분류별 세탁물 세탁 (1회 한정 서비스)
        </li>
      </ul>

      <div className="flex justify-between">
        <button className="bg-gray-200 px-4 py-2 rounded">이전</button>
        <button
          onClick={handleNext}
          className="bg-orange-500 text-white px-4 py-2 rounded"
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default ReservationStep1;
