import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/route';
import ReservationStep1 from '@/components/features/consumer/ReservationStep1';
// 향후: ReservationStep2 import 예정

const ConsumerReservationCreate: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    serviceType: '',
    serviceDetailType: '',
  });

  const handleNextFromStep1 = (data: { serviceType: string; serviceDetailType: string }) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(2);
  };

  return (
    <div>
      <h1>예약 생성</h1>
      {step === 1 && <ReservationStep1 onNext={handleNextFromStep1} />}
      {/* step === 2 이면 <ReservationStep2 /> 렌더링 예정 */}
    </div>
  );
};

export default ConsumerReservationCreate;
