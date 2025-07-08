import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useManager } from '@/hooks';
import { useToast } from '@/hooks';
import { usePagination } from '@/hooks/usePagination';
import { LoadingSpinner } from '@/components/common';
import { ROUTES } from '@/constants';
import { SERVICE_TYPE_LABELS } from '@/constants/service';
import type {
  ManagerReviewListResponse,
  ManagerReviewItem,
} from '@/types/manager';
import { Header } from '@/components/layout/Header/Header';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  goToNext: () => void;
  goToPrevious: () => void;
  goToPage: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  hasNext,
  hasPrevious,
  goToNext,
  goToPrevious,
  goToPage,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6 mb-4">
      {/* 이전 페이지 버튼 */}
      <button
        onClick={goToPrevious}
        disabled={!hasPrevious}
        className={`p-2 rounded-lg ${
          hasPrevious
            ? 'bg-white border border-gray-200 hover:bg-gray-50'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* 페이지 번호 */}
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => goToPage(index)}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              currentPage === index
                ? 'bg-orange-500 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* 다음 페이지 버튼 */}
      <button
        onClick={goToNext}
        disabled={!hasNext}
        className={`p-2 rounded-lg ${
          hasNext
            ? 'bg-white border border-gray-200 hover:bg-gray-50'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ReviewCardProps {
  review: ManagerReviewItem;
}

// 개별 리뷰 카드 컴포넌트
const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => {
      const diff = rating - index;
      const isFullStar = diff >= 1;
      const isHalfStar = diff > 0 && diff < 1;

      if (isHalfStar) {
        return (
          <div key={index} className="relative w-4 h-4">
            {/* 배경 빈 별 */}
            <Star className="absolute inset-0 w-4 h-4 text-gray-300" />
            {/* 절반 채워진 별 */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: '50%' }}
            >
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>
          </div>
        );
      }

      return (
        <Star
          key={index}
          className={`w-4 h-4 ${
            isFullStar
              ? 'text-yellow-400 fill-yellow-400' // 완전한 별
              : 'text-gray-300' // 빈 별
          }`}
        />
      );
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200">
      {/* 리뷰어 정보 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 text-base">
            {review.name}
          </h3>
          <div className="flex items-center gap-1">
            {renderStars(review.rating)}
            <span className="text-sm text-gray-500 ml-1">
              ({review.rating})
            </span>
          </div>
        </div>
      </div>

      {/* 리뷰 내용 */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <p className="text-gray-700 leading-relaxed text-sm">
          {review.comment}
        </p>
      </div>

      {/* 서비스 정보 */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
            {SERVICE_TYPE_LABELS[
              review.serviceType as keyof typeof SERVICE_TYPE_LABELS
            ] || review.serviceType}
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-600">{review.serviceDetailType}</span>
        </div>
      </div>
    </div>
  );
};

// 리뷰 통계 컴포넌트 Props 타입
interface ReviewStatsProps {
  reviews: ManagerReviewItem[];
}

// 리뷰 통계 컴포넌트
const ReviewStats: React.FC<ReviewStatsProps> = ({ reviews }) => {
  // 실제 데이터를 기반으로 평균 평점 계산
  const totalRating = reviews.reduce(
    (sum, review) => sum + Number(review.rating),
    0,
  );
  const averageRating =
    reviews.length > 0 ? Number((totalRating / reviews.length).toFixed(1)) : 0;

  // 소수점 평점을 반올림하여 정수로 변환하여 분포 계산
  const ratingCounts = Array.from({ length: 5 }, (_, index) => {
    const targetRating = 5 - index;
    const count = reviews.filter(
      (review) => Math.round(Number(review.rating)) === targetRating,
    ).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

    return {
      rating: targetRating,
      count,
      percentage: Number(percentage.toFixed(1)),
    };
  });

  // 리뷰 통계용 별점 렌더링 함수 (절반별 지원)
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => {
      const diff = rating - index;
      const isFullStar = diff >= 1;
      const isHalfStar = diff > 0 && diff < 1;

      if (isHalfStar) {
        return (
          <div key={index} className="relative w-5 h-5">
            {/* 배경 빈 별 */}
            <Star className="absolute inset-0 w-5 h-5 text-gray-300" />
            {/* 절반 채워진 별 */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: '50%' }}
            >
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
          </div>
        );
      }

      return (
        <Star
          key={index}
          className={`w-5 h-5 ${
            isFullStar
              ? 'text-yellow-400 fill-yellow-400' // 완전한 별
              : 'text-gray-300' // 빈 별
          }`}
        />
      );
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      {/* 전체 평점 */}
      <div className="flex items-end gap-4 mb-6">
        <div className="text-5xl font-bold text-orange-500">
          {averageRating}
        </div>
        <div className="flex flex-col justify-end">
          <div className="flex items-center gap-1 mb-2">
            {renderStars(averageRating)}
          </div>
          <div className="text-sm text-gray-500">
            총 {reviews.length}개의 리뷰
          </div>
        </div>
      </div>

      {/* 평점별 분포 */}
      <div className="space-y-3">
        {ratingCounts.map(({ rating, count, percentage }) => (
          <div key={rating} className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-8 font-medium">
              {rating}점
            </span>
            <div className="flex-1 bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm text-gray-500 w-8 text-right font-medium">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 메인 컴포넌트
const ManagerReviews: React.FC = () => {
  const navigate = useNavigate();
  const { fetchMyReviews, loading } = useManager();
  const { showToast } = useToast();

  const [reviewData, setReviewData] =
    useState<ManagerReviewListResponse | null>(null);

  const reviews = reviewData?.reviews || [];

  // 페이지네이션 훅 사용 (5개씩 표시)
  const {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    hasNext,
    hasPrevious,
    goToNext: originalGoToNext,
    goToPrevious: originalGoToPrevious,
    goToPage: originalGoToPage,
  } = usePagination({
    totalItems: reviews.length,
    itemsPerPage: 5,
    initialPage: 0,
  });

  // 페이지 변경 시 스크롤을 위로 이동하는 함수들
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToNext = () => {
    originalGoToNext();
    scrollToTop();
  };

  const goToPrevious = () => {
    originalGoToPrevious();
    scrollToTop();
  };

  const goToPage = (page: number) => {
    originalGoToPage(page);
    scrollToTop();
  };

  // 현재 페이지에 표시할 리뷰들
  const currentReviews = reviews.slice(startIndex, endIndex);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const data = await fetchMyReviews();
      if (data) {
        setReviewData(data);
      }
    } catch (error) {
      console.error('리뷰 데이터 로드 실패:', error);
      showToast('리뷰를 불러오는데 실패했습니다.', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner message="리뷰를 불러오는 중..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        variant="sub"
        title="리뷰"
        backRoute={ROUTES.MANAGER.MYPAGE}
        showMenu={true}
      />

      {/* Content */}
      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          {reviews.length > 0 ? (
            <>
              {/* 리뷰 통계 */}
              <ReviewStats reviews={reviews} />

              {/* 현재 페이지 리뷰 목록 */}
              <div className="space-y-4">
                {currentReviews.map((review) => (
                  <ReviewCard key={review.reviewId} review={review} />
                ))}
              </div>

              {/* 페이지네이션 */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                goToNext={goToNext}
                goToPrevious={goToPrevious}
                goToPage={goToPage}
              />
            </>
          ) : (
            /* 빈 상태 */
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div className="mb-4">
                <Star className="w-16 h-16 text-gray-300 mx-auto" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                아직 리뷰가 없습니다
              </h2>
              <p className="text-gray-500 mb-6">
                첫 번째 서비스를 완료하고
                <br />
                고객님의 소중한 리뷰를 받아보세요!
              </p>
              <button
                onClick={() => navigate(ROUTES.MANAGER.MYPAGE)}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                마이페이지로 이동
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerReviews;
