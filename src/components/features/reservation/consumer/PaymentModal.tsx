import React, { useState } from 'react';
import { reservationApi } from '@/apis/reservation';
import { useToast } from '@/hooks/useToast';
import { usePoint } from '@/hooks/domain/usePoint';
import PaymentBreakdown from './PaymentBreakdown';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: {
    reservationId: number;
    totalPrice: number;
    roomSize?: number;
    serviceAdd?: string;
    additionalOptions?: Array<{
      id: string;
      label: string;
      price: number;
      time: number;
      count?: number;
    }>;
  };
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  reservation,
}) => {
  const [pointToUse, setPointToUse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [usePointChecked, setUsePointChecked] = useState(false);
  const { showToast } = useToast();
  const { point, fetchPoint } = usePoint();
  React.useEffect(() => {
    fetchPoint();
  }, [fetchPoint]);

  if (!isOpen) return null;

  const handlePayment = async () => {
    setLoading(true);
    try {
      await reservationApi.payment({
        reservationId: reservation.reservationId,
        pointToUse:
          usePointChecked && pointToUse ? Number(pointToUse) : undefined,
        pointUsed: usePointChecked,
      });
      showToast('결제가 완료되었습니다!', 'success');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (e) {
      showToast('결제에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || Number(value) > 0) {
      setPointToUse(value);
    }
  };

  const expectedPayment = Math.max(
    reservation.totalPrice - (pointToUse ? Number(pointToUse) : 0),
    0,
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[400px] shadow-lg">
        <h2 className="text-lg font-bold mb-4">결제하기</h2>
        {/* 결제 상세 정보 */}
        <PaymentBreakdown reservation={reservation} />
        <div className="mb-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="use-point-checkbox"
            checked={usePointChecked}
            onChange={() => setUsePointChecked((prev) => !prev)}
            disabled={loading}
          />
          <label
            htmlFor="use-point-checkbox"
            className="text-sm text-gray-700 select-none cursor-pointer"
          >
            포인트 사용
          </label>
        </div>
        {usePointChecked && (
          <>
            <div className="mb-2 flex justify-between items-center">
              <span className="text-sm text-gray-500">사용 가능 포인트</span>
              <span className="text-sm font-semibold text-black pr-4">
                {point !== null ? point.toLocaleString() + 'P' : '-'}
              </span>
            </div>
            <div className="mb-2 flex justify-between items-center">
              <span></span>
              <input
                type="number"
                min={1}
                max={reservation.totalPrice}
                className="px-1 py-0.5 border text-center border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 w-20 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                value={pointToUse}
                onChange={handlePointChange}
                disabled={loading}
                placeholder=""
              />
            </div>
          </>
        )}
        <div className="mb-4 flex justify-between">
          <span>예상 결제금액</span>
          <span className="font-bold text-orange-500">
            {expectedPayment.toLocaleString()}원
          </span>
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-2xl bg-gray-200"
            onClick={onClose}
            disabled={loading}
          >
            취소
          </button>
          <button
            className="px-4 py-2 rounded-2xl bg-blue-500 text-white"
            onClick={handlePayment}
            disabled={loading || expectedPayment < 0}
          >
            {loading ? '결제 중...' : '결제하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
