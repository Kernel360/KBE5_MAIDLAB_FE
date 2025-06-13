import React, { useState } from 'react';
import ReservationStep1 from '@/components/features/consumer/ReservationStep1';
import ReservationStep2 from '@/components/features/consumer/ReservationStep2';
import ReservationStep3 from '@/components/features/consumer/ReservationStep3';
import type { ReservationFormData } from '@/types/reservation';

const ConsumerReservationCreate: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ReservationFormData>>({});

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

  const handleCompleteReservation = () => {setStep(1); setFormData({})}

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-8 my-8">
      <h1 className="text-2xl font-bold mb-2">예약 생성</h1>
      <p className="mb-6 text-gray-500">📍현재 Step: {step}</p>
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
