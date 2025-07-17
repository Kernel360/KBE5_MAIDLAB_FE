import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Settings,
  ChevronRight,
  Coins,
  Heart,
  Ban,
  Users,
  Lock,
} from 'lucide-react';
import { useConsumer } from '@/hooks/domain/useConsumer';
import { useToast } from '@/hooks/useToast';
import type { ConsumerMyPageResponse } from '@/types/domain/consumer';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header/Header';
import PasswordChangeModal from '@/components/common/PasswordChangeModal/PasswordChangeModal';
import { ShareModal } from '@/components/common';
import { usePoint } from '@/hooks/domain/usePoint';

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

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchMypage, loading } = useConsumer();
  const { showToast } = useToast();
  const { changePassword } = useAuth();
  const [userInfo, setUserInfo] = useState<ConsumerMyPageResponse | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const { point: apiPoint, fetchPoint, loading: pointLoading } = usePoint();

  useEffect(() => {
    const loadUserInfo = async () => {
      const data = await fetchMypage();
      if (data) {
        setUserInfo(data);
      }
    };
    loadUserInfo();
  }, [fetchMypage]);

  useEffect(() => {
    fetchPoint();
  }, [fetchPoint]);

  const handleProfileEdit = () => {
    navigate(ROUTES.CONSUMER.PROFILE);
  };

  const handlePoints = () => {
    navigate(ROUTES.CONSUMER.POINTS);
  };

  const handleLikedManagers = () => {
    navigate(ROUTES.CONSUMER.LIKED_MANAGERS);
  };

  const handleBlacklist = () => {
    navigate(ROUTES.CONSUMER.BLACKLIST);
  };

  const handleInviteFriends = () => {
    setShowShareModal(true);
  };

  const handleSettings = () => {
    showToast('설정 기능은 준비 중입니다.', 'info');
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
      throw error;
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
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
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              {/* Profile Section */}
              <div className="text-center mb-8">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mx-auto">
                    {userInfo?.profileImage ? (
                      <img
                        src={userInfo.profileImage}
                        alt="프로필"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {userInfo?.name || '사용자'}
                </h2>

                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-gray-600">포인트:</span>
                  {pointLoading ? (
                    <span className="text-gray-400">로딩 중...</span>
                  ) : apiPoint !== null ? (
                    <span className="text-[#FF6B00] font-medium">
                      {apiPoint.toLocaleString()}P
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>

                <button
                  onClick={handleProfileEdit}
                  className="w-full py-3 bg-[#FF6B00] text-white rounded-lg font-medium hover:bg-[#FF8533] transition-colors mb-2"
                >
                  프로필 조회
                </button>
              </div>

              {/* Menu Items */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="border-t border-gray-200">
                  <MenuItem
                    icon={<Coins className="w-5 h-5" />}
                    title="포인트"
                    onClick={handlePoints}
                  />
                </div>
                <div className="border-t border-gray-200">
                  <MenuItem
                    icon={<Heart className="w-5 h-5" />}
                    title="찜한 도우미"
                    onClick={handleLikedManagers}
                  />
                </div>
                <div className="border-t border-gray-200">
                  <MenuItem
                    icon={<Ban className="w-5 h-5" />}
                    title="블랙리스트 도우미"
                    onClick={handleBlacklist}
                  />
                </div>
                <div className="border-t border-gray-200">
                  <MenuItem
                    icon={<Users className="w-5 h-5" />}
                    title="친구 초대하기"
                    onClick={handleInviteFriends}
                  />
                </div>
                {/* 비밀번호 변경 메뉴: 소셜 로그인 사용자는 숨김 */}
                {userInfo && !userInfo.socialType && (
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
                    title="알림 설정"
                    onClick={handleSettings}
                  />
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

        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title="MaidLab 친구 초대"
          url="https://www.maidlab.site"
          text={`${userInfo?.name || '사용자'}님이 MaidLab에 초대합니다!`}
        />
      </div>
    </>
  );
};

export default MyPage;
