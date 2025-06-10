import React, { useState } from 'react';
import ReservationStep1 from '@/components/features/consumer/ReservationStep1';
import ReservationStep2 from '@/components/features/consumer/ReservationStep2';
import ReservationStep3 from '@/components/features/consumer/ReservationStep3';
import type { ReservationFormData } from '@/types/reservation';
import { useReservation } from '@/hooks/useReservation';
import type { ReservationRequestDto } from '@/apis/reservation';

const ConsumerReservationCreate: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ReservationFormData>>({});
  const { createReservation } = useReservation();

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

  const handleCompleteReservation = async (finalData: ReservationRequestDto) => {
    try {
      const result = await createReservation(finalData);
      if (result.success) {
        alert('예약이 완료되었습니다.');
        setStep(1);
        setFormData({});
      } else {
        alert('예약 생성 실패: ' + result.error);
      }
    } catch (error) {
      alert('예약 요청 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>예약 생성</h1>
      <p>📍현재 Step: {step}</p>
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
          onComplete={handleCompleteReservation}
        />
      )}
    </div>
  );
};

export default ConsumerReservationCreate;
