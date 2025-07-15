import React from 'react';

interface PaymentBreakdownProps {
  reservation: {
    roomSize?: number;
    totalPrice: number;
    additionalOptions?: Array<{
      id: string;
      label: string;
      price: number;
      time: number;
      count?: number;
    }>;
  };
}

const PaymentBreakdown: React.FC<PaymentBreakdownProps> = ({ reservation }) => {
  // 옵션 금액 합산 계산
  const optionTotal =
    reservation.additionalOptions && reservation.additionalOptions.length > 0
      ? reservation.additionalOptions.reduce(
          (sum, option) => sum + option.price * (option.count || 1),
          0,
        )
      : 0;

  return (
    <div className="mb-4 bg-orange-50 rounded-xl p-4">
      {/* 기본 요금 */}
      <div className="flex justify-between py-1">
        <span className="text-gray-600">서비스 기본 요금</span>
        <span className="text-gray-900">
          {reservation.roomSize !== undefined
            ? `${(reservation.roomSize * 10000).toLocaleString()}원`
            : '-'}
        </span>
      </div>
      {/* 옵션 금액 합산 */}
      {optionTotal > 0 && (
        <div className="flex justify-between py-1">
          <span className="text-gray-600">옵션 금액 합산</span>
          <span className="text-gray-900">
            +{optionTotal.toLocaleString()}원
          </span>
        </div>
      )}
      {/* 총 금액 */}
      <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center">
        <span className="text-lg font-semibold text-gray-900">총 금액</span>
        <span className="text-lg font-bold text-orange-500">
          {reservation.totalPrice.toLocaleString()}원
        </span>
      </div>
    </div>
  );
};

export default PaymentBreakdown;
