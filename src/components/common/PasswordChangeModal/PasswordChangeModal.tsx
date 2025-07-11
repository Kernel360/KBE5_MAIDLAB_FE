import React, { useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newPassword: string) => Promise<void>;
  loading?: boolean;
}

interface PasswordData {
  newPassword: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
}

interface PasswordErrors {
  newPassword: string;
  confirmPassword: string;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [passwordData, setPasswordData] = useState<PasswordData>({
    newPassword: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
  });

  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = (
    field: keyof PasswordData,
    value: string | boolean,
  ) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 해당 필드의 에러 메시지 클리어
    if (field === 'newPassword' && passwordErrors.newPassword) {
      setPasswordErrors((prev) => ({ ...prev, newPassword: '' }));
    }
    if (field === 'confirmPassword' && passwordErrors.confirmPassword) {
      setPasswordErrors((prev) => ({ ...prev, confirmPassword: '' }));
    }
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: PasswordErrors = { newPassword: '', confirmPassword: '' };

    if (!passwordData.newPassword.trim()) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요.';
    } else if (
      passwordData.newPassword.length < 8 ||
      passwordData.newPassword.length > 20
    ) {
      newErrors.newPassword = '8~20자 영문, 숫자를 입력해주세요.';
    }

    if (!passwordData.confirmPassword.trim()) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    setPasswordErrors(newErrors);
    return !newErrors.newPassword && !newErrors.confirmPassword;
  };

  const handleSubmit = async () => {
    if (!validatePasswordForm()) return;

    try {
      await onSubmit(passwordData.newPassword);
      handleClose();
    } catch (error) {
      // 에러는 부모 컴포넌트에서 처리
    }
  };

  const handleClose = () => {
    setPasswordData({
      newPassword: '',
      confirmPassword: '',
      showPassword: false,
      showConfirmPassword: false,
    });
    setPasswordErrors({ newPassword: '', confirmPassword: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">비밀번호 변경</h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-5">
          {/* 새 비밀번호 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              새 비밀번호
            </label>
            <div className="relative">
              <input
                type={passwordData.showPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) =>
                  handlePasswordChange('newPassword', e.target.value)
                }
                placeholder="새 비밀번호를 입력하세요"
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  passwordErrors.newPassword
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() =>
                  handlePasswordChange(
                    'showPassword',
                    !passwordData.showPassword,
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {passwordData.showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {passwordErrors.newPassword && (
              <p className="text-red-500 text-sm mt-1">
                {passwordErrors.newPassword}
              </p>
            )}
          </div>

          {/* 비밀번호 확인 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호 확인
            </label>
            <div className="relative">
              <input
                type={passwordData.showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  handlePasswordChange('confirmPassword', e.target.value)
                }
                placeholder="비밀번호를 한 번 더 입력하세요"
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  passwordErrors.confirmPassword
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() =>
                  handlePasswordChange(
                    'showConfirmPassword',
                    !passwordData.showConfirmPassword,
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {passwordData.showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {passwordErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {passwordErrors.confirmPassword}
              </p>
            )}
          </div>

          <div className="py-1" />

          {/* 제출 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeModal;
