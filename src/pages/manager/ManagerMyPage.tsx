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
import type { MypageResponseDto, ReviewListResponseDto } from '@/apis/manager';

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
  const { fetchMypage, fetchMyReviews, loading } = useManager();
  const { showToast } = useToast();

  const [profileData, setProfileData] = useState<MypageResponseDto | null>(
    null,
  );
  const [reviewData, setReviewData] = useState<ReviewListResponseDto | null>(
    null,
  );

  // 페이지 로드 시 데이터 불러오기
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 마이페이지 정보 불러오기
      const profile = await fetchMypage();
      if (profile) {
        setProfileData(profile);
      }

      // 리뷰 정보 불러오기
      const reviews = await fetchMyReviews();
      if (reviews) {
        setReviewData(reviews);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };

  const handleProfileEdit = () => {
    navigate(ROUTES.MANAGER.PROFILE_EDIT);
  };

  const handlePaymentAccount = () => {
    showToast('결제계좌 관리 기능을 준비 중입니다.', 'info');
  };

  const handleSettlementHistory = () => {
    navigate(ROUTES.MANAGER.SETTLEMENTS);
  };

  const handleReviews = () => {
    navigate(ROUTES.MANAGER.REVIEWS);
  };

  const handleInviteFriend = () => {
    showToast('친구 초대 기능을 준비 중입니다.', 'info');
  };

  const handleSettings = () => {
    showToast('설정 페이지를 준비 중입니다.', 'info');
  };

  // 로딩 중
  if (loading) {
    return <LoadingSpinner message="마이페이지를 불러오는 중..." />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={() => navigate(-1)}
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
              onClick={handleProfileEdit}
              className="w-full py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              프로필 수정
            </button>
          </div>

          {/* Menu Items */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <MenuItem
              icon={<FileText className="w-5 h-5" />}
              title="결제계좌 관리"
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
                title="진구 조대하기"
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
  );
};

export default ManagerMyPage;
