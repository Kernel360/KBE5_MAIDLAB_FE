import React, { useState } from 'react';

interface WithdrawConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const WithdrawConfirmModal: React.FC<WithdrawConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [checked, setChecked] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
          정말 회원 탈퇴하시겠습니까?
        </h3>
        <div className="text-sm text-gray-700 mb-4 text-center">
          <span className="font-semibold text-red-500">
            포인트, 예약, 개인정보 등 모든 데이터가 즉시 삭제 되며,
          </span>
          <br />
          <span className="font-semibold">복구가 불가능합니다.</span>
        </div>
        <div className="flex items-center mb-6">
          <input
            id="withdraw-agree"
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="checkbox-orange"
          />
          <label
            htmlFor="withdraw-agree"
            className="ml-2 text-sm text-gray-700 select-none cursor-pointer"
          >
            위 내용을 모두 이해했고, 정말로 탈퇴에 동의합니다.
          </label>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700"
            onClick={onClose}
          >
            취소
          </button>
          <button
            className="btn-primary"
            onClick={onConfirm}
            disabled={!checked}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawConfirmModal;
