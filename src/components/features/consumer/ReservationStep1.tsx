// src/components/features/consumer/ReservationStep1.tsx
import React, { useState } from 'react';
import ReservationHeader from './ReservationHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation/BottomNavigation';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { SERVICE_DETAIL_TYPES } from '@/constants/service';

interface Props {
  onNext: (data: { serviceType: string; serviceDetailType: string }) => void;
  onBack?: () => void;
}

const TABS = [
  { key: '생활청소', label: '생활 청소' },
  { key: '부분청소', label: '부분 청소' },
];

const ReservationStep1: React.FC<Props> = ({ onNext, onBack }) => {
  const [selectedTab, setSelectedTab] = useState<'생활청소' | '부분청소'>('생활청소');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const detail = SERVICE_DETAIL_TYPES[selectedTab];

  const handleNext = () => {
    if (selectedTab === '부분청소') {
      window.alert('서비스 준비중입니다.');
      return;
    }
    onNext({ serviceType: 'GENERAL_CLEANING', serviceDetailType: selectedTab });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="absolute top-0 left-0 w-full z-20">
        <ReservationHeader title="일반 청소를 선택하셨네요!" onBack={onBack || (() => window.history.back())} />
      </div>
      <div className="flex-1 flex flex-col items-center pt-20 px-4">
        <h2 className="text-lg font-bold mb-2 mt-2">하위 옵션을 선택해 주세요.</h2>
        <div className="w-full max-w-md flex gap-2 mt-4 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`flex-1 py-2 rounded-lg font-semibold border transition text-base ${selectedTab === tab.key ? 'bg-orange-50 border-orange-500 text-orange-500' : 'bg-white border-gray-200 text-gray-500'}`}
              onClick={() => setSelectedTab(tab.key as '생활청소' | '부분청소')}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="w-full max-w-md card mt-2 mb-6">
          <ul className="text-sm space-y-2 text-gray-700">
            {detail.options?.map((opt, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✔</span>
                <span>{opt}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-between w-full max-w-md mt-4">
          <button
            onClick={onBack || (() => window.history.back())}
            className="btn btn-secondary w-1/3"
          >
            이전
          </button>
          <button
            onClick={handleNext}
            className="btn btn-primary w-1/2"
          >
            다음
          </button>
        </div>
      </div>
      <BottomNavigation
        activeTab="reservation"
        onTabClick={navigate}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
};

export default ReservationStep1;
