import React from 'react';

interface CheckInOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reservationId: number, isCheckIn: boolean) => void;
  isCheckIn: boolean;
  reservationInfo: {
    serviceType: string;
    detailServiceType: string;
    time: string;
    reservationId?: number;
  };
}

export const CheckInOutModal: React.FC<CheckInOutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isCheckIn,
  reservationInfo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-4">
            서비스를 {isCheckIn ? '시작' : '종료'}하시겠습니까?
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="font-medium">
              {reservationInfo.serviceType} →{' '}
              {reservationInfo.detailServiceType}
            </p>
            <p className="text-gray-600 text-sm mt-1">{reservationInfo.time}</p>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={() => onConfirm(reservationInfo.reservationId!, isCheckIn)}
              className="px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600"
            >
              {isCheckIn ? '체크인' : '체크아웃'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInOutModal; 