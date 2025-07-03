import React from 'react';
import { formatPrice } from '@/utils';
import { formatKoreanDate, formatTime } from '@/utils/date';
import { Calendar, Clock, MapPin, Home, Heart, CheckCircle, X } from 'lucide-react';
import { SERVICE_TYPE_LABELS, PET_TYPES, FEE_CONFIG } from '@/constants/service';

interface MatchingCardProps {
  matching: any;
  onAccept: () => void;
  onReject: () => void;
}

export const MatchingCard: React.FC<MatchingCardProps> = ({ matching, onAccept, onReject }) => {
  // 플랫폼 수수료 + 부가세를 떼고 난 예상 수익 계산
  const totalPrice = typeof matching.totalPrice === 'string' 
    ? parseInt(matching.totalPrice.replace(/[^0-9]/g, '') || '0')
    : Number(matching.totalPrice) || 0;
  const platformFee = Math.floor(totalPrice * FEE_CONFIG.PLATFORM_FEE_RATE);
  const vat = Math.floor(totalPrice * FEE_CONFIG.VAT_RATE);
  const totalDeduction = platformFee + vat;
  const expectedEarning = totalPrice - totalDeduction;
  
  // 서비스 타입 한글명 가져오기
  const serviceTypeLabel = SERVICE_TYPE_LABELS[matching.serviceType as keyof typeof SERVICE_TYPE_LABELS] || matching.serviceType;
  
  // 반려동물 표시 개선
  const petDisplay = PET_TYPES[matching.pet as keyof typeof PET_TYPES] || matching.pet;
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 mb-4">
      {/* Status Badge */}
      <div className="absolute top-0 right-0 bg-orange-500 text-white px-3 py-1 rounded-bl-lg text-xs font-semibold">
        새 요청
      </div>
      
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {matching.detailServiceType}
            </h3>
            <p className="text-sm text-gray-600">
              {serviceTypeLabel}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">예상 수익</div>
            <div className="text-xl font-bold text-green-700">
              {formatPrice(expectedEarning.toString())}
            </div>
          </div>
        </div>
      </div>

      {/* Information */}
      <div className="px-5 pb-4">
        <div className="grid gap-3">
          {/* Date & Time */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 font-medium mb-1">일정</div>
              <div className="text-sm font-semibold text-gray-900">
                {formatKoreanDate(matching.reservationDate)}
              </div>
              <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" />
                {formatTime(matching.startTime)} ~ {formatTime(matching.endTime)}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 font-medium mb-1">위치</div>
              <div className="text-sm font-semibold text-gray-900">
                {matching.address}
              </div>
              {matching.addressDetail && (
                <div className="text-xs text-gray-600 mt-1">
                  {matching.addressDetail}
                </div>
              )}
            </div>
          </div>

          {/* Room Size & Pet Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                <Home className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 font-medium mb-1">방크기</div>
                <div className="text-sm font-semibold text-gray-900">
                  {matching.roomSize}평
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg">
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 font-medium mb-1">반려동물</div>
                <div className="text-sm font-semibold text-gray-900">
                  {petDisplay}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Breakdown */}
      <div className="px-5 pb-4">
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="text-xs text-gray-500 mb-2">수수료 내역</div>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">총 요청 금액</span>
              <span className="font-semibold">{formatPrice(totalPrice.toString())}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">플랫폼 수수료 (10%)</span>
              <span className="text-red-500 font-semibold">-{formatPrice(platformFee.toString())}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">부가세 (10%)</span>
              <span className="text-red-500 font-semibold">-{formatPrice(vat.toString())}</span>
            </div>
            <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center">
              <span className="font-bold text-gray-900">실제 수령액</span>
              <span className="font-bold text-green-700 text-lg">{formatPrice(expectedEarning.toString())}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onReject}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all duration-200"
          >
            <X className="w-4 h-4" />
            거절
          </button>
          <button
            onClick={onAccept}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all duration-200"
          >
            <CheckCircle className="w-4 h-4" />
            수락하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchingCard; 