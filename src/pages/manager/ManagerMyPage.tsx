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
} from 'lucide-react';
import { useManager, useToast } from '@/hooks';
import { LoadingSpinner } from '@/components/common';
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

  const [profileData, setProfileData] = useState<ManagerMyPageResponse | null>(
    null,
  );

  useEffect(() => {
    loadData();
  }, []);

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

  // TODO: 친구초대 기능 추가
  const handleInviteFriend = () => {
    showToast('친구 초대 기능을 준비 중입니다.', 'info');
  };

  // TODO: 설정 페이지 추가
  const handleSettings = () => {
    showToast('설정 페이지를 준비 중입니다.', 'info');
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
                  title="친구 조대하기"
                  onClick={handleInviteFriend}
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
    </div>
  );
};

export default ManagerMyPage;
