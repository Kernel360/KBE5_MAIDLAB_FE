import React, { useState } from 'react';
import { usePoint } from '@/hooks/domain/usePoint';

interface ChargePointModalProps {
  onClose: () => void;
  onCharge: (amount: number) => void;
}

const ChargePointModal: React.FC<ChargePointModalProps> = ({
  onClose,
  onCharge,
}) => {
  const [amount, setAmount] = useState<string>('');
  const { chargePoint, loading } = usePoint();

  const handleCharge = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return;
    const result = await chargePoint(numAmount);
    if (result.success) {
      onCharge(numAmount);
      setAmount('');
    } else {
      alert('충전에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
        <h2 className="text-lg font-bold mb-4">포인트 충전</h2>
        <input
          type="number"
          min={1}
          className="border rounded px-3 py-2 w-full mb-4"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="충전할 금액 입력"
        />
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-200"
            onClick={onClose}
            disabled={loading}
          >
            취소
          </button>
          <button
            className="px-4 py-2 rounded bg-orange-500 text-white"
            onClick={handleCharge}
            disabled={loading || !amount || Number(amount) <= 0}
          >
            {loading ? '충전 중...' : '충전'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChargePointModal;
