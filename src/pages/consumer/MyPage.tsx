import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Settings,
  ChevronRight,
  CreditCard,
  Ticket,
  Coins,
  Heart,
  Ban,
  Users,
} from 'lucide-react';
import { useConsumer } from '@/hooks/domain/useConsumer';
import { useToast } from '@/hooks/useToast';
import type { ConsumerMyPageResponse, MenuItemProps } from '@/types/consumer';
import { ROUTES } from '@/constants';

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
  const [userInfo, setUserInfo] = useState<ConsumerMyPageResponse | null>(null);

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

  const handlePaymentMethods = () => {
    showToast('결제수단 관리 기능은 준비 중입니다.', 'info');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">마이페이지</h1>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <div className="max-w-md mx-auto space-y-6">
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
              className="w-full py-3 bg-[#FF6B00] text-white rounded-lg font-medium hover:bg-[#FF8533] transition-colors"
            >
              프로필 조회
            </button>
          </div>

          {/* Menu Items */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <MenuItem
              icon={<CreditCard className="w-5 h-5" />}
              title="결제수단 관리"
              onClick={handlePaymentMethods}
            />
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
  );
};

export default MyPage;