import React, { useState, useEffect } from 'react';
import ReservationStep0 from '@/components/features/consumer/ReservationStep0';
import ReservationStep1 from '@/components/features/consumer/ReservationStep1';
import ReservationStep2 from '@/components/features/consumer/ReservationStep2';
import type { ReservationFormData } from '@/types/domain/reservation';
import { useLocation } from 'react-router-dom';

const ConsumerReservationCreate: React.FC = () => {
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<ReservationFormData>>({});
  const [selectedServiceType, setSelectedServiceType] = useState<string>('');

  // 구글맵에서 step: 2로 진입 시 바로 Step2로 이동 및 주소 반영
  useEffect(() => {
    if (location.state && (location.state as any).step === 2) {
      const { address, lat, lng } = location.state as any;
      setFormData((prev) => ({ ...prev, address, lat, lng }));
      setStep(2);
      // state 초기화(뒤로가기 시 중복 방지)
      if (window.history.replaceState) {
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state]);

  // step0: 서비스 분류 선택
  const handleNextFromStep0 = (serviceType: string) => {
    setSelectedServiceType(serviceType);
    setFormData((prev) => ({ ...prev, serviceType }));
    setStep(1);
  };

  // step1: 서비스 상세 선택
  const handleNextFromStep1 = (data: Partial<ReservationFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(2);
  };
  const handleBackToStep0 = () => setStep(0);

  return (
    <div className="min-h-screen bg-gray-50">
      {step === 0 && <ReservationStep0 onNext={handleNextFromStep0} />}
      {step === 1 && (
        <ReservationStep1
          onNext={handleNextFromStep1}
          onBack={handleBackToStep0}
        />
      )}
      {step === 2 && (
        <ReservationStep2
          initialData={formData}
          onBack={handleBackToStep0}
          onSubmit={() => {
            setStep(0);
            setFormData({});
            setSelectedServiceType('');
          }}
        />
      )}
    </div>
  );
};

export default ConsumerReservationCreate;
