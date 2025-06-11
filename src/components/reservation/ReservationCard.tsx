import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { RESERVATION_STATUS, RESERVATION_STATUS_LABELS } from '@/constants/status';
import { formatDateTime, formatPrice } from '@/utils';
import type { ReservationResponseDto } from '@/apis/reservation';

interface ReservationCardProps {
  reservation: ReservationResponseDto;
  onClick: () => void;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({ reservation, onClick }) => {
  const navigate = useNavigate();
  const {
    reservationId,
    status,
    serviceType,
    detailServiceType,
    reservationDate,
    startTime,
    endTime,
    isExistReview,
    totalPrice,
  } = reservation;

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: 예약 취소 기능 구현
  };

  const handleReviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(ROUTES.CONSUMER.REVIEW_REGISTER.replace(':id', reservationId.toString()));
  };

  const getStatusBadge = () => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-600';

    switch (status) {
      case RESERVATION_STATUS.PENDING:
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-700';
        break;
      case RESERVATION_STATUS.APPROVED:
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-700';
        break;
      case RESERVATION_STATUS.MATCHED:
        bgColor = 'bg-indigo-100';
        textColor = 'text-indigo-700';
        break;
      case RESERVATION_STATUS.WORKING:
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-700';
        break;
      case RESERVATION_STATUS.COMPLETED:
        bgColor = 'bg-green-100';
        textColor = 'text-green-700';
        break;
      case RESERVATION_STATUS.CANCELED:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-700';
        break;
      case RESERVATION_STATUS.REJECTED:
        bgColor = 'bg-red-100';
        textColor = 'text-red-700';
        break;
      default:
        break;
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {RESERVATION_STATUS_LABELS[status]}
      </span>
    );
  };

  const renderActionButtons = () => {
    const buttons = [];

    // 상세보기 버튼은 항상 표시
    buttons.push(
      <button
        key="detail"
        onClick={onClick}
        className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
      >
        상세보기
      </button>
    );

    // 대기중인 경우 예약 취소 버튼 표시
    if (status === RESERVATION_STATUS.PENDING) {
      buttons.unshift(
        <button
          key="cancel"
          onClick={handleCancelClick}
          className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50"
        >
          예약 취소
        </button>
      );
    }

    // 완료되고 리뷰가 없는 경우 리뷰 작성 버튼 표시
    if (status === RESERVATION_STATUS.COMPLETED && !isExistReview) {
      buttons.unshift(
        <button
          key="review"
          onClick={handleReviewClick}
          className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600"
        >
          리뷰 작성
        </button>
      );
    }

    return buttons;
  };

  return (
    <div
      className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold">
            {serviceType} &gt; {detailServiceType}
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            {formatDateTime(new Date(`${reservationDate}T${startTime}`))} ~ {endTime}
          </p>
        </div>
        {getStatusBadge()}
      </div>

      <div className="mt-2">
        <p className="text-lg font-bold text-blue-600">
          {formatPrice(totalPrice)}원
        </p>
      </div>

      {status === RESERVATION_STATUS.COMPLETED && isExistReview && (
        <div className="mt-2">
          <p className="text-sm text-green-600 font-medium">
            서비스가 완료되었습니다
          </p>
        </div>
      )}

      <div className="mt-4 flex justify-end gap-2">
        {renderActionButtons()}
      </div>
    </div>
  );
};

const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default ReservationCard; 