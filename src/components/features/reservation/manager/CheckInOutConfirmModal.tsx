import React from 'react';

interface CheckInOutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCheckIn: boolean;
}

export const CheckInOutConfirmModal: React.FC<CheckInOutConfirmModalProps> = ({
  isOpen,
  onClose,
  isCheckIn,
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
            {isCheckIn ? '체크인이 완료되었습니다.' : '체크아웃이 완료되었습니다.'}
          </h3>
          <button
            onClick={onClose}
            className="px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckInOutConfirmModal;