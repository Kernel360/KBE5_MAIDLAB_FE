import React from 'react';
import { formatDateTime, formatPrice } from '@/utils';

interface MatchingCardProps {
  matching: any;
  onAccept: () => void;
  onReject: () => void;
}

export const MatchingCard: React.FC<MatchingCardProps> = ({ matching, onAccept, onReject }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 mb-5 shadow-sm">
      <div className="font-extrabold text-lg text-[#4B2E13] mb-2">{matching.detailServiceType} &gt; {matching.serviceType}</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
        <div className="text-sm text-gray-400">날짜/시간</div>
        <div className="text-base text-[#4B2E13] font-semibold">{formatDateTime(matching.reservationDate)} {matching.startTime} ~ {matching.endTime}</div>
        <div className="text-sm text-gray-400">위치</div>
        <div className="text-base text-[#4B2E13] font-semibold">{matching.address} {matching.addressDetail}</div>
        <div className="text-sm text-gray-400">방크기</div>
        <div className="text-base text-[#4B2E13] font-semibold">{matching.roomSize}평</div>
        <div className="text-sm text-gray-400">반려동물</div>
        <div className="text-base text-[#4B2E13] font-semibold">{matching.pet}</div>
        <div className="text-sm text-gray-400">금액</div>
        <div className="text-base font-bold text-orange-500">{formatPrice(matching.totalPrice)}</div>
      </div>
      <div className="flex gap-2 mt-2">
        <button
          onClick={onAccept}
          className="flex-1 py-2 border-2 border-orange-400 text-orange-500 rounded-full font-bold hover:bg-orange-50 transition"
        >
          수락
        </button>
        <button
          onClick={onReject}
          className="flex-1 py-2 border-2 border-red-400 text-red-500 rounded-full font-bold hover:bg-red-50 transition"
        >
          거절
        </button>
      </div>
    </div>
  );
};

export default MatchingCard; 