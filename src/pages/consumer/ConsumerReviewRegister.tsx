import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useReview } from '@/hooks';
import { usePoint } from '@/hooks/domain/usePoint';
import { useToast } from '@/hooks';
import { ROUTES } from '@/constants';
import { LENGTH_LIMITS } from '@/constants/validation';
import {
  ArrowLeft,
  Star,
  Sparkles,
  Edit3,
  ThumbsUp,
  ThumbsDown,
  Minus,
  X,
} from 'lucide-react';
import type { ReviewRegisterRequest } from '@/types/domain/review';
import type { ReviewFormData } from '@/types/domain/consumer';
import type { PreferenceType } from '@/constants';

// 키워드 템플릿 데이터
const REVIEW_KEYWORDS = {
  positive: [
    {
      category: '서비스 품질',
      keywords: ['친절함', '전문적', '꼼꼼함', '신속함', '정확함', '깔끔함'],
    },
    {
      category: '커뮤니케이션',
      keywords: [
        '소통 원활',
        '응답 빠름',
        '설명 자세함',
        '이해하기 쉬움',
        '예의 바름',
        '경청 잘함',
      ],
    },
    {
      category: '만족도',
      keywords: [
        '기대 이상',
        '만족스러움',
        '추천하고 싶음',
        '재이용 의향',
        '가성비 좋음',
        '신뢰감',
      ],
    },
  ],
  negative: [
    {
      category: '서비스 아쉬운 점',
      keywords: [
        '불친절함',
        '대충 처리',
        '실력 부족',
        '지각',
        '불성실함',
        '약속 불이행',
      ],
    },
    {
      category: '커뮤니케이션 문제',
      keywords: [
        '소통 어려움',
        '응답 늦음',
        '설명 부족',
        '말이 안 통함',
        '무례함',
        '귀 기울이지 않음',
      ],
    },
    {
      category: '개선 필요사항',
      keywords: [
        '시간 준수 필요',
        '더 꼼꼼히',
        '친절도 개선',
        '전문성 향상',
        '책임감 필요',
        '신뢰도 개선',
      ],
    },
  ],
};

// 별점 컴포넌트
const RatingSection: React.FC<{
  rating: number;
  onChange: (rating: number) => void;
}> = ({ rating, onChange }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1:
        return '아쉬워요';
      case 2:
        return '별로예요';
      case 3:
        return '보통이에요';
      case 4:
        return '좋아요';
      case 5:
        return '최고예요';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          서비스는 어떠셨나요?
        </h2>
        <p className="text-gray-500 mb-8">별점을 선택해주세요</p>

        <div className="flex justify-center items-center gap-3 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-2 transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-200 rounded-full"
            >
              <Star
                className={`w-12 h-12 transition-all duration-200 ${
                  star <= (hoverRating || rating)
                    ? 'text-yellow-400 fill-yellow-400 drop-shadow-sm'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl p-4 inline-block">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {rating}.0
          </div>
          <div className="text-gray-600 font-medium">
            {getRatingText(rating)}
          </div>
        </div>
      </div>
    </div>
  );
};

// 키워드 선택 인라인 컴포넌트
const KeywordSelection: React.FC<{
  rating: number;
  selectedKeywords: string[];
  onKeywordToggle: (keyword: string) => void;
  onKeywordRemove: (keyword: string) => void;
}> = ({ rating, selectedKeywords, onKeywordToggle, onKeywordRemove }) => {
  const keywordData =
    rating >= 4 ? REVIEW_KEYWORDS.positive : REVIEW_KEYWORDS.negative;
  const maxKeywords = 6;
  const isMaxReached = selectedKeywords.length >= maxKeywords;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">키워드 선택</h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${rating >= 4 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}
        >
          {rating >= 4 ? '긍정 키워드' : '개선 키워드'}
        </span>
        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
          최대 {maxKeywords}개
        </span>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        {rating >= 4
          ? '만족스러운 점들을 키워드로 선택해보세요'
          : '아쉬웠던 부분들을 키워드로 선택해보세요'}
        {isMaxReached && (
          <span className="block text-orange-600 font-medium mt-1">
            최대 {maxKeywords}개까지 선택 가능합니다
          </span>
        )}
      </p>
      <div className="space-y-4">
        {keywordData.map((group) => (
          <div key={group.category}>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {group.category}
            </h4>
            <div className="flex flex-wrap gap-2">
              {group.keywords.map((keyword) => {
                const isSelected = selectedKeywords.includes(keyword);
                const isDisabled = !isSelected && isMaxReached;
                return (
                  <button
                    key={keyword}
                    type="button"
                    onClick={() => onKeywordToggle(keyword)}
                    disabled={isDisabled}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all
                      ${isSelected ? 'bg-orange-100 text-orange-700 border-2 border-orange-400' : isDisabled ? 'bg-gray-50 text-gray-400 border-2 border-transparent cursor-not-allowed' : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-orange-50'}
                    `}
                  >
                    {keyword}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {selectedKeywords.length > 0 && (
        <div className="mt-6 p-4 bg-orange-50 rounded-xl">
          <h4 className="text-sm font-medium text-orange-800 mb-2">
            선택된 키워드 ({selectedKeywords.length}/{maxKeywords}개)
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedKeywords.map((keyword) => (
              <div
                key={keyword}
                className="relative inline-flex items-center px-3 py-1.5 bg-orange-200 text-orange-800 text-xs rounded-full pr-8"
              >
                <span>{keyword}</span>
                <button
                  type="button"
                  onClick={() => onKeywordRemove(keyword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-orange-300 hover:bg-orange-400 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1"
                >
                  <X className="w-2.5 h-2.5 text-orange-700" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 리뷰 작성 컴포넌트
const ReviewTextArea: React.FC<{
  comment: string;
  onChange: (comment: string) => void;
}> = ({ comment, onChange }) => {
  const remainingChars = LENGTH_LIMITS.REVIEW_COMMENT.MAX - comment.length;
  const isValid = comment.length <= LENGTH_LIMITS.REVIEW_COMMENT.MAX;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <Edit3 className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">직접 리뷰 작성</h3>
      </div>

      <textarea
        value={comment}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-32 p-4 border-2 rounded-xl resize-none text-base transition-all focus:outline-none ${
          isValid
            ? 'border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100'
            : comment.length > 0
              ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100'
              : 'border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100'
        }`}
        placeholder={`서비스는 어떠셨나요? 솔직한 후기를 남겨주세요.`}
      />

      <div className="flex justify-between items-center mt-3">
        <div>
          {!isValid && comment.length > 0 && (
            <span className="text-red-500 text-sm font-medium">
              최대 {LENGTH_LIMITS.REVIEW_COMMENT.MAX}자까지 작성 가능합니다
            </span>
          )}
        </div>
        <span
          className={`text-sm font-medium ${
            remainingChars < 50 ? 'text-orange-500' : 'text-gray-500'
          }`}
        >
          {comment.length} / {LENGTH_LIMITS.REVIEW_COMMENT.MAX}
        </span>
      </div>
    </div>
  );
};

// 도우미 관리 컴포넌트
const HelperManagement: React.FC<{
  preference: PreferenceType;
  onChange: (preference: PreferenceType) => void;
}> = ({ preference, onChange }) => {
  const options = [
    {
      type: 'LIKE' as PreferenceType,
      icon: ThumbsUp,
      title: '좋은 도우미',
      description: '다시 이용하고 싶어요',
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      activeColor: 'bg-green-500 text-white border-green-500',
      iconColor: 'text-green-600',
    },
    {
      type: 'NONE' as PreferenceType,
      icon: Minus,
      title: '평가만',
      description: '특별한 의견 없음',
      color: 'gray',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      activeColor: 'bg-gray-600 text-white border-gray-600',
      iconColor: 'text-gray-500',
    },
    {
      type: 'BLACKLIST' as PreferenceType,
      icon: ThumbsDown,
      title: '피하고 싶음',
      description: '다시 이용하지 않을래요',
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      activeColor: 'bg-red-500 text-white border-red-500',
      iconColor: 'text-red-600',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        이 도우미에 대한 평가
      </h3>
      <p className="text-gray-500 text-sm mb-6">향후 매칭에 반영됩니다</p>

      <div className="grid grid-cols-1 gap-3">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = preference === option.type;

          return (
            <button
              key={option.type}
              type="button"
              onClick={() => onChange(option.type)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200 ${
                isSelected
                  ? option.activeColor
                  : `${option.bgColor} ${option.borderColor} hover:shadow-sm`
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-2 rounded-lg ${isSelected ? 'bg-white bg-opacity-20' : option.bgColor}`}
                >
                  <Icon
                    className={`w-5 h-5 ${isSelected ? 'text-white' : option.iconColor}`}
                  />
                </div>
                <div className="text-left flex-1">
                  <div
                    className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}
                  >
                    {option.title}
                  </div>
                  <div
                    className={`text-sm ${isSelected ? 'text-white text-opacity-90' : 'text-gray-500'}`}
                  >
                    {option.description}
                  </div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ConsumerReviewRegister: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { registerReview } = useReview();
  const { chargePoint } = usePoint();
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 5,
    comment: '',
    preference: 'NONE',
  });

  const isKeywordValid = selectedKeywords.length > 0;
  const isFormValid = isKeywordValid || formData.comment.length > 0;

  const handleKeywordToggle = (keyword: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : prev.length < 6
          ? [...prev, keyword]
          : prev,
    );
  };
  const handleKeywordRemove = (keyword: string) => {
    setSelectedKeywords((prev) => prev.filter((k) => k !== keyword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) {
      error('예약 정보를 찾을 수 없습니다.');
      return;
    }
    if (!isFormValid) {
      error('키워드를 선택하거나 리뷰를 작성해주세요.');
      return;
    }
    setIsSubmitting(true);
    try {
      const data: ReviewRegisterRequest = {
        reservationId: parseInt(id),
        rating: formData.rating,
        comment: formData.comment,
        keywords: selectedKeywords,
        ...(formData.preference !== 'NONE' && {
          likes: formData.preference === 'LIKE',
        }),
      };
      await registerReview(data);
      
      // 리뷰 등록 성공 시 500 포인트 충전
      try {
        await chargePoint(500);
        success('리뷰가 등록되었습니다! 500 포인트가 적립되었습니다 🎉');
      } catch (pointError) {
        // 포인트 충전 실패해도 리뷰 등록은 성공이므로 알림
        success('리뷰가 등록되었습니다!');
        error('포인트 적립 중 오류가 발생했습니다.');
      }
      
      navigate(ROUTES.CONSUMER.RESERVATIONS);
    } catch (err) {
      error('리뷰 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="sticky top-0 z-20 bg-white shadow-sm">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-200 rounded-lg p-2 -ml-2"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="font-medium">뒤로</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">리뷰 작성</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-md mx-auto">
        <div className="p-4 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 별점 섹션 */}
            <RatingSection
              rating={formData.rating}
              onChange={(rating) =>
                setFormData((prev) => ({ ...prev, rating }))
              }
            />

            {/* 키워드 선택 인라인 */}
            <KeywordSelection
              rating={formData.rating}
              selectedKeywords={selectedKeywords}
              onKeywordToggle={handleKeywordToggle}
              onKeywordRemove={handleKeywordRemove}
            />

            {/* 직접 리뷰 작성 */}
            <ReviewTextArea
              comment={formData.comment}
              onChange={(comment) =>
                setFormData((prev) => ({ ...prev, comment }))
              }
            />

            {/* 도우미 관리 */}
            <HelperManagement
              preference={formData.preference}
              onChange={(preference) =>
                setFormData((prev) => ({ ...prev, preference }))
              }
            />

            {/* 제출 버튼 */}
            <div className="pt-4 pb-8">
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`w-full py-4 rounded-2xl text-lg font-bold transition-all duration-200 focus:outline-none focus:ring-4 shadow-lg ${isFormValid && !isSubmitting ? 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-200 hover:shadow-xl hover:-translate-y-0.5' : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'}`}
              >
                {isSubmitting ? '등록 중...' : '리뷰 등록하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConsumerReviewRegister;
