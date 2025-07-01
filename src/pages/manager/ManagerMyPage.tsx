import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Settings,
  FileText,
  MessageCircle,
  Share2,
  ChevronRight,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useManager, useToast, useAuth } from '@/hooks';
import { LoadingSpinner, ShareModal } from '@/components/common';
import { ROUTES } from '@/constants';
import type { ManagerMyPageResponse } from '@/types/manager';

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
  >
    <div className="flex items-center gap-3">
      <div className="text-gray-600">{icon}</div>
      <span className="text-gray-900">{title}</span>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400" />
  </button>
);

const ManagerMyPage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchMypage, loading } = useManager();
  const { showToast } = useToast();
  const { changePassword } = useAuth();
  const [profileData, setProfileData] = useState<ManagerMyPageResponse | null>(
    null,
  );
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (profileData) {
      checkGoogleUser();
    }
  }, [profileData]);

  const loadData = async () => {
    try {
      const profile = await fetchMypage();
      if (profile) {
        setProfileData(profile);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };

  const checkGoogleUser = () => {
    // API 응답에서 소셜 로그인 정보 확인
    if (profileData?.socialType === 'GOOGLE') {
      setIsGoogleUser(true);
    } else {
      setIsGoogleUser(false);
    }
  };

  const handleProfile = () => {
    navigate(ROUTES.MANAGER.PROFILE);
  };

  // TODO: 정산계좌 관리 기능 추가
  const handlePaymentAccount = () => {
    showToast('정산계좌 관리 기능을 준비 중입니다.', 'info');
  };

  const handleSettlementHistory = () => {
    navigate(ROUTES.MANAGER.SETTLEMENTS);
  };

  const handleReviews = () => {
    navigate(ROUTES.MANAGER.REVIEWS);
  };

  const handleInviteFriend = () => {
    setShowShareModal(true);
  };

  // TODO: 설정 페이지 추가
  const handleSettings = () => {
    showToast('설정 페이지를 준비 중입니다.', 'info');
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (field === 'newPassword' && passwordErrors.newPassword) {
      setPasswordErrors((prev) => ({ ...prev, newPassword: '' }));
    }
    if (field === 'confirmPassword' && passwordErrors.confirmPassword) {
      setPasswordErrors((prev) => ({ ...prev, confirmPassword: '' }));
    }
  };

  const validatePasswordForm = (): boolean => {
    const newErrors = { newPassword: '', confirmPassword: '' };
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

  const handlePasswordSubmit = async () => {
    if (!validatePasswordForm()) return;
    setChangingPassword(true);
    try {
      const result = await changePassword(passwordData.newPassword);
      if (result.success) {
        setShowPasswordModal(false);
        setPasswordData({
          newPassword: '',
          confirmPassword: '',
          showPassword: false,
          showConfirmPassword: false,
        });
        setPasswordErrors({ newPassword: '', confirmPassword: '' });
        showToast('비밀번호가 변경되었습니다.', 'success');
      }
    } catch (error) {
      showToast('비밀번호 변경에 실패했습니다.', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="마이페이지를 불러오는 중..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <button
          onClick={() => navigate(ROUTES.HOME)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">마이페이지</h1>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            {/* Profile Section */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mx-auto">
                  {profileData?.profileImage ? (
                    <img
                      src={profileData.profileImage}
                      alt="프로필"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {profileData?.name || '김 매니저'}
              </h2>

              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-gray-600">매니저</span>
                {profileData?.isVerified ? (
                  <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                    승인완료
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                    승인대기
                  </span>
                )}
              </div>

              <button
                onClick={handleProfile}
                className="w-full py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                프로필 보기
              </button>
            </div>

            {/* Menu Items */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <MenuItem
                icon={<FileText className="w-5 h-5" />}
                title="정산계좌 관리"
                onClick={handlePaymentAccount}
              />
              <div className="border-t border-gray-200">
                <MenuItem
                  icon={<FileText className="w-5 h-5" />}
                  title="정산 내역"
                  onClick={handleSettlementHistory}
                />
              </div>
              <div className="border-t border-gray-200">
                <MenuItem
                  icon={<MessageCircle className="w-5 h-5" />}
                  title="리뷰 확인하기"
                  onClick={handleReviews}
                />
              </div>
              <div className="border-t border-gray-200">
                <MenuItem
                  icon={<Share2 className="w-5 h-5" />}
                  title="친구 초대하기"
                  onClick={handleInviteFriend}
                />
              </div>
              {!isGoogleUser && (
                <div className="border-t border-gray-200">
                  <MenuItem
                    icon={<Lock className="w-5 h-5" />}
                    title="비밀번호 변경"
                    onClick={() => setShowPasswordModal(true)}
                  />
                </div>
              )}
              <div className="border-t border-gray-200">
                <MenuItem
                  icon={<Settings className="w-5 h-5" />}
                  title="설정"
                  onClick={handleSettings}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">비밀번호 변경</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
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
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      passwordErrors.newPassword
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPasswordData((prev) => ({
                        ...prev,
                        showPassword: !prev.showPassword,
                      }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호 확인
                </label>
                <div className="relative">
                  <input
                    type={
                      passwordData.showConfirmPassword ? 'text' : 'password'
                    }
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      handlePasswordChange('confirmPassword', e.target.value)
                    }
                    placeholder="비밀번호를 한 번 더 입력하세요"
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      passwordErrors.confirmPassword
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPasswordData((prev) => ({
                        ...prev,
                        showConfirmPassword: !prev.showConfirmPassword,
                      }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
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
              <button
                onClick={handlePasswordSubmit}
                disabled={changingPassword}
                className={`w-full py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors mt-4`}
              >
                {changingPassword ? '변경 중...' : '비밀번호 변경'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 공유 모달 */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="MaidLab 매니저 초대"
        url={`${window.location.origin}/manager/register?ref=${profileData?.userId || 'unknown'}`}
        text={`${profileData?.name || '매니저'}님이 MaidLab 매니저로 초대합니다!`}
      />
    </div>
  );
};

export default ManagerMyPage;
