import React from 'react';
import ReservationHeader from './ReservationHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation/BottomNavigation';
import { useAuth, useToast } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import {SERVICE_LIST} from '@/constants/service'
interface Props {
  onNext: (serviceType: string) => void;
}

const ReservationStep0: React.FC<Props> = ({ onNext }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const handleSelect = (key: string) => {
    if (key === 'GENERAL_CLEANING') {
      onNext(key);
    } else {
      showToast('서비스 준비중입니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="absolute top-0 left-0 w-full z-20">
        <ReservationHeader title="서비스 선택" onBack={() => window.history.back()} />
      </div>
      <div className="flex-1 flex flex-col justify-start items-center pt-20 px-4">
        <h2 className="text-xl font-bold mb-2 mt-2">서비스를 선택해주세요</h2>
        <div className="w-full max-w-md flex flex-col gap-6 mt-8">
          {SERVICE_LIST.map((item) => (
            <button
              key={item.id}
              className="flex items-center gap-4 card shadow hover:shadow-md transition cursor-pointer py-5 px-6 text-lg font-semibold text-gray-800 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-400"
              onClick={() => handleSelect(item.id)}
            >
              <span className="text-4xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
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

export default ReservationStep0; 