import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCheck: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  isCheck,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="text-center">
          <div className="mb-4">
            <div
              className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                isCheck ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              {isCheck ? (
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
              ) : (
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>
          </div>

          <h3 className="text-lg font-medium mb-4">
            {isCheck ? '예약이 수락되었습니다.' : '예약이 거절되었습니다.'}
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

export default ConfirmModal;
