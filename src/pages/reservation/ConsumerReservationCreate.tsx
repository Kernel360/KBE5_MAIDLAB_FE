import React, { useState, useEffect } from 'react';
import ReservationStep1 from '@/components/features/consumer/ReservationStep1';
import ReservationStep2 from '@/components/features/consumer/ReservationStep2';
import ReservationStep3 from '@/components/features/consumer/ReservationStep3';
import type { ReservationFormData } from '@/types/reservation';
import { useLocation } from 'react-router-dom';

const ConsumerReservationCreate: React.FC = () => {
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ReservationFormData>>({});

  // 구글맵에서 step: 2로 진입 시 바로 Step2로 이동 및 주소 반영
  useEffect(() => {
    if (location.state && (location.state as any).step === 2) {
      const { address, lat, lng } = location.state as any;
      setFormData(prev => ({ ...prev, address, lat, lng }));
      setStep(2);
      // state 초기화(뒤로가기 시 중복 방지)
      if (window.history.replaceState) {
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state]);

  const handleNextFromStep1 = (data: Partial<ReservationFormData>) => {
    console.log('🟢 Step1 완료:', data);
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleBackToStep1 = () => {
    setStep(1);
  };

  const handleSubmitFromStep2 = (data: Partial<ReservationFormData>) => {
    console.log('🟢 Step2 완료:', data);
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(3);
  };

  const handleBackToStep2 = () => {
    setStep(2);
  };

  const handleCompleteReservation = () => {
    setStep(1);
    setFormData({});
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-8 my-8">
      {step === 1 && <ReservationStep1 onNext={handleNextFromStep1} />}
      {step === 2 && (
        <ReservationStep2
          initialData={formData}
          onBack={handleBackToStep1}
          onSubmit={handleSubmitFromStep2}
        />
      )}
      {step === 3 && (
        <ReservationStep3
          data={formData as ReservationFormData}
          onBack={handleBackToStep2}
          onSubmit={handleCompleteReservation}
        />
      )}
    </div>
  );
};

export default ConsumerReservationCreate;
