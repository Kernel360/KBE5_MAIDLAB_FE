import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Settings,
  ChevronRight,
  Ticket,
  Coins,
  Heart,
  Ban,
  Users,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useConsumer } from '@/hooks/domain/useConsumer';
import { useToast } from '@/hooks/useToast';
import type { ConsumerMyPageResponse } from '@/types/consumer';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { BottomNavigation } from '@/components/layout/BottomNavigation/BottomNavigation';
import { Header } from '@/components/layout/Header/Header';

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

  useEffect(() => {
    const loadUserInfo = async () => {
      const data = await fetchMypage();
      if (data) {
        setUserInfo(data);
      }
    };
    loadUserInfo();
  }, [fetchMypage]);

  const handleBack = () => {
    navigate(ROUTES.HOME);
  };

  const handleProfileEdit = () => {
    navigate(ROUTES.CONSUMER.PROFILE);
  };

  const handlePromotions = () => {
    showToast('프로모션 코드/쿠폰 기능은 준비 중입니다.', 'info');
  };

  const handlePoints = () => {
    showToast('포인트 기능은 준비 중입니다.', 'info');
  };

  const handleLikedManagers = () => {
    navigate(ROUTES.CONSUMER.LIKED_MANAGERS);
  };

  const handleBlacklist = () => {
    navigate(ROUTES.CONSUMER.BLACKLIST);
  };

  const handleInviteFriends = () => {
    showToast('친구 초대하기 기능은 준비 중입니다.', 'info');
  };

  const handleSettings = () => {
    showToast('설정 기능은 준비 중입니다.', 'info');
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
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 content-with-bottom-nav">
        {/* Header */}
        <Header
          variant="sub"
          title="마이페이지"
          backRoute={ROUTES.HOME}
          showMenu={false}
        />

        {/* Content */}
        <div className="px-4 pt-6 pb-3">
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
                  {userInfo?.point !== undefined && (
                    <span className="text-[#FF6B00] font-medium">
                      {userInfo.point}P
                    </span>
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
                    icon={<Ticket className="w-5 h-5" />}
                    title="프로모션 코드/쿠폰"
                    onClick={handlePromotions}
                  />
                </div>
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
                <h3 className="text-lg font-bold text-gray-900">
                  비밀번호 변경
                </h3>
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
                      className={`w-full px-4 py-3 pr-12 border focus:outline-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
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
      </div>
      <BottomNavigation
        activeTab="profile"
        onTabClick={navigate}
        isAuthenticated={!!userInfo}
      />
    </>
  );
};

export default MyPage;
