import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  FileText,
  MessageCircle,
  Share2,
  ChevronRight,
  Lock,
  Trash,
} from 'lucide-react';
import { useManager, useToast, useAuth } from '@/hooks';
import { useWithdraw } from '@/hooks/useWithdraw';
import { LoadingSpinner, ShareModal } from '@/components/common';
import PasswordChangeModal from '@/components/common/PasswordChangeModal/PasswordChangeModal';
import { Header } from '@/components/layout/Header/Header';
import { ROUTES } from '@/constants';
import type { ManagerMyPageResponse } from '@/types/domain/manager';
import WithdrawConfirmModal from '@/components/common/WithdrawConfirmModal';
import { authApi } from '@/apis/auth';
import { tokenStorage, userStorage } from '@/utils/storage';

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
  >
    <div className="flex items-center gap-3">
      <div className="text-gray-600 dark:text-gray-300">{icon}</div>
      <span className="text-gray-900 dark:text-white">{title}</span>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
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
  const [changingPassword, setChangingPassword] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const { withdraw, withdrawing } = useWithdraw();

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
    if (withdrawing) return;
    navigate(ROUTES.MANAGER.PROFILE);
  };

  const handleSettlementHistory = () => {
    if (withdrawing) return;
    navigate(ROUTES.MANAGER.SETTLEMENTS);
  };

  const handleReviews = () => {
    if (withdrawing) return;
    navigate(ROUTES.MANAGER.REVIEWS);
  };

  const handleInviteFriend = () => {
    if (withdrawing) return;
    setShowShareModal(true);
  };

  const handleWithdraw = () => {
    setWithdrawModalOpen(true);
  };
  const handleWithdrawConfirm = async () => {
    try {
      await authApi.withdraw();
      // 모든 토큰, 유저 정보 삭제
      tokenStorage.clearTokens();
      userStorage.clearUserData();
      sessionStorage.clear();
      // 쿠키에서 refreshToken 삭제 (js-cookie 미사용 시 직접 삭제)
      document.cookie = 'refreshToken=; Max-Age=0; path=/;';
      showToast('회원 탈퇴가 완료되었습니다.', 'success');
      setTimeout(() => {
        window.location.replace('/');
      }, 1000);
    } catch (e) {
      showToast('회원 탈퇴에 실패했습니다.', 'error');
    } finally {
      setWithdrawModalOpen(false);
    }
  };

  const handlePasswordSubmit = async (newPassword: string) => {
    setChangingPassword(true);
    try {
      const result = await changePassword(newPassword);
      if (result.success) {
        setShowPasswordModal(false);
        showToast('비밀번호가 변경되었습니다.', 'success');
      }
    } catch (error) {
      showToast('비밀번호 변경에 실패했습니다.', 'error');
      throw error; // 모달에서 에러 처리할 수 있도록
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="마이페이지를 불러오는 중..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header
        variant="sub"
        title="마이페이지"
        backRoute={ROUTES.HOME}
        showMenu={true}
      />

      {/* Content */}
      <main className="px-4 py-6 pb-20">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
            {/* Profile Section */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden mx-auto">
                  {profileData?.profileImage ? (
                    <img
                      src={profileData.profileImage}
                      alt="프로필"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {profileData?.name || '김 매니저'}
              </h2>

              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-gray-600 dark:text-gray-300">매니저</span>
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
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              <div className="border-t border-gray-200 dark:border-gray-600">
                <MenuItem
                  icon={<FileText className="w-5 h-5" />}
                  title="정산 내역"
                  onClick={handleSettlementHistory}
                />
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600">
                <MenuItem
                  icon={<MessageCircle className="w-5 h-5" />}
                  title="리뷰 확인하기"
                  onClick={handleReviews}
                />
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600">
                <MenuItem
                  icon={<Share2 className="w-5 h-5" />}
                  title="친구 초대하기"
                  onClick={handleInviteFriend}
                />
              </div>
              {!isGoogleUser && (
                <div className="border-t border-gray-200 dark:border-gray-600">
                  <MenuItem
                    icon={<Lock className="w-5 h-5" />}
                    title="비밀번호 변경"
                    onClick={() => setShowPasswordModal(true)}
                  />
                </div>
              )}
              {/* 회원 탈퇴 버튼 추가 */}
              <div className="border-t border-gray-200 dark:border-gray-600">
                <div className="text-red-500">
                  <MenuItem
                    icon={<Trash className="w-5 h-5" />}
                    title="회원 탈퇴"
                    onClick={handleWithdraw}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 비밀번호 변경 모달 */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordSubmit}
        loading={changingPassword}
      />

      {/* 공유 모달 */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="MaidLab 매니저 초대"
        url="https://www.maidlab.site"
        text={`${profileData?.name || '매니저'}님이 MaidLab 매니저로 초대합니다!`}
      />

      <WithdrawConfirmModal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        onConfirm={withdraw}
      />
    </div>
  );
};

export default ManagerMyPage;
