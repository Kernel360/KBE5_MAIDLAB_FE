import React from 'react';
import { RESERVATION_STATUS_LABELS } from '@/constants/status';
import { SERVICE_TYPE_LABELS, SERVICE_TYPES } from '@/constants/service';
import { formatKoreanDate, formatPrice } from '@/utils';
import type { ReservationListResponse } from '@/types/reservation';
import { Calendar, Clock, DollarSign, User, ChevronRight } from 'lucide-react';

interface ReservationCardProps {
  reservation: ReservationListResponse;
  getStatusBadgeStyle: (status: string, reservationDate: string) => string;
  onReviewClick?: (reservationId: number, event: React.MouseEvent) => void;
  onDetailClick?: (reservationId: number) => void;
  onPaymentClick?: (reservationId: number, event: React.MouseEvent) => void;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  getStatusBadgeStyle,
  onReviewClick,
  onDetailClick,
  onPaymentClick,
}) => {
  // 상태별 색상 매핑
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MATCHED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PAID':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'WORKING':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const showReviewButton =
    !reservation.isExistReview && reservation.status === 'COMPLETED';
  const showPaymentButton = reservation.status === 'MATCHED';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* 헤더 */}
      <div className="p-4 pb-3 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-base mb-1">
              {
                SERVICE_TYPE_LABELS[
                  reservation.serviceType as keyof typeof SERVICE_TYPES
                ]
              }
            </h3>
            <p className="text-sm text-gray-500">
              {reservation.detailServiceType}
            </p>
          </div>
          <span
            className={`
              px-3 py-1 text-xs font-medium rounded-full border
              ${getStatusColor(reservation.status)}
            `}
          >
            {RESERVATION_STATUS_LABELS[reservation.status]}
          </span>
        </div>
      </div>

      {/* 예약 정보 */}
      <div className="p-4 space-y-3">
        {/* 날짜 및 시간 */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2 flex-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {formatKoreanDate(reservation.reservationDate)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {reservation.startTime} - {reservation.endTime}
            </span>
          </div>
        </div>

        {/* 가격 정보 */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">총 금액</span>
          </div>
          <span className="text-lg font-bold text-orange-600">
            {formatPrice(reservation.totalPrice)}
          </span>
        </div>
      </div>

      {/* 하단 액션 영역 */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          className="flex-1 flex items-center justify-center text-sm text-gray-500 bg-gray-50 rounded-xl px-3 py-2 hover:bg-gray-100 transition"
          onClick={() =>
            onDetailClick && onDetailClick(reservation.reservationId)
          }
        >
          <span>자세히 보기</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
        {showPaymentButton && onPaymentClick && (
          <button
            className="flex-1 flex items-center justify-center text-sm bg-blue-500 text-white rounded-xl px-3 py-2 hover:bg-blue-600 transition"
            onClick={(e) => onPaymentClick(reservation.reservationId, e)}
          >
            <span>결제하기</span>
          </button>
        )}
        {showReviewButton && onReviewClick && (
          <button
            className="flex-1 flex items-center justify-center text-sm bg-orange-500 text-white rounded-xl px-3 py-2 hover:bg-orange-600 transition"
            onClick={(e) => onReviewClick(reservation.reservationId, e)}
          >
            <span>리뷰 작성</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ReservationCard;
