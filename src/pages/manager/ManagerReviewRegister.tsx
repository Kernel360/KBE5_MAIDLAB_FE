import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useReservation } from '@/hooks/domain/useReservation';
import { ROUTES } from '@/constants';
import { LENGTH_LIMITS } from '@/constants/validation';
import { ArrowLeft, Star, Sparkles, Edit3, X } from 'lucide-react';
import type { ReviewRegisterRequest } from '@/types/reservation';
import type { ReviewFormData } from '@/types/consumer';

// 매니저용 키워드 템플릿 데이터
const MANAGER_REVIEW_KEYWORDS = {
  positive: [
    { category: '고객 태도', keywords: ['친절함', '예의 바름', '배려심 있음', '감사 표현', '존중해줌', '협조적임'] },
    { category: '업무 환경', keywords: ['집 정리됨', '접근 용이', '작업 공간 확보', '필요한 도구 준비', '깨끗한 환경', '안전한 환경'] },
    { category: '소통 & 요청', keywords: ['요청 명확함', '사전 안내 좋음', '유연한 일정', '합리적 요청', '추가 요청 없음', '이해도 높음'] }
  ],
  negative: [
    { category: '고객 태도 문제', keywords: ['무례함', '불친절함', '과도한 요구', '갑질', '무시하는 태도', '협조 안 함'] },
    { category: '업무 환경 문제', keywords: ['집 너무 더러움', '정리 안됨', '도구 미준비', '접근 어려움', '위험한 환경', '작업 방해'] },
    { category: '소통 & 요청 문제', keywords: ['요청 불명확', '사전 안내 부족', '예약과 다름', '무리한 요청', '추가 업무 강요', '시간 미준수'] }
  ]
};

// 별점 컴포넌트
const RatingSection: React.FC<{
  rating: number;
  onChange: (rating: number) => void;
}> = ({ rating, onChange }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return '매우 불만';
      case 2: return '불만족';
      case 3: return '보통';
      case 4: return '만족';
      case 5: return '매우 만족';
      default: return '';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          고객은 어떠셨나요?
        </h2>
        <p className="text-gray-500 mb-8">업무 진행이 원활했는지 평가해주세요</p>
        
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

// 매니저용 키워드 선택 컴포넌트
const ManagerKeywordSelection: React.FC<{
  rating: number;
  selectedKeywords: string[];
  onKeywordToggle: (keyword: string) => void;
  onKeywordRemove: (keyword: string) => void;
}> = ({ rating, selectedKeywords, onKeywordToggle, onKeywordRemove }) => {
  const keywordData = rating >= 4 ? MANAGER_REVIEW_KEYWORDS.positive : MANAGER_REVIEW_KEYWORDS.negative;
  const maxKeywords = 6;
  const isMaxReached = selectedKeywords.length >= maxKeywords;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">키워드 선택</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          rating >= 4 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
        }`}>
          {rating >= 4 ? '긍정 키워드' : '개선 키워드'}
        </span>
        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
          최대 {maxKeywords}개
        </span>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        {rating >= 4 
          ? '만족스러웠던 점들을 키워드로 선택해보세요' 
          : '아쉬웠던 점들을 키워드로 선택해보세요'
        }
        {isMaxReached && (
          <span className="block text-orange-600 font-medium mt-1">
            최대 {maxKeywords}개까지 선택 가능합니다
          </span>
        )}
      </p>
      
      <div className="space-y-4">
        {keywordData.map((group) => (
          <div key={group.category}>
            <h4 className="text-sm font-medium text-gray-700 mb-2">{group.category}</h4>
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
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      isSelected
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                        : isDisabled
                          ? 'bg-gray-50 text-gray-400 border-2 border-transparent cursor-not-allowed'
                          : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                    }`}
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
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            선택된 키워드 ({selectedKeywords.length}/{maxKeywords}개)
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedKeywords.map((keyword) => (
              <div
                key={keyword}
                className="relative inline-flex items-center px-3 py-1.5 bg-blue-200 text-blue-800 text-xs rounded-full pr-8"
              >
                <span>{keyword}</span>
                <button
                  type="button"
                  onClick={() => onKeywordRemove(keyword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-300 hover:bg-blue-400 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                >
                  <X className="w-2.5 h-2.5 text-blue-700" />
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
  isOptional: boolean;
}> = ({ comment, onChange, isOptional }) => {
  const remainingChars = LENGTH_LIMITS.REVIEW_COMMENT.MAX - comment.length;
  const isValid = isOptional || comment.length >= LENGTH_LIMITS.REVIEW_COMMENT.MIN;
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <Edit3 className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">직접 리뷰 작성</h3>
        {isOptional && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            선택사항
          </span>
        )}
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
        placeholder={
          isOptional 
            ? `키워드 외에 추가로 하고 싶은 말이 있다면 작성해주세요.\n(선택사항)`
            : `고객과의 업무는 어떠셨나요? 솔직한 후기를 남겨주세요.\n(업무 환경, 고객 태도, 요청사항 등)\n최소 ${LENGTH_LIMITS.REVIEW_COMMENT.MIN}자 이상 작성해주세요.`
        }
      />
      
      <div className="flex justify-between items-center mt-3">
        <div>
          {!isValid && comment.length > 0 && (
            <span className="text-red-500 text-sm font-medium">
              최소 {LENGTH_LIMITS.REVIEW_COMMENT.MIN}자 이상 작성해주세요
            </span>
          )}
        </div>
        <span className={`text-sm font-medium ${
          remainingChars < 50 ? 'text-orange-500' : 'text-gray-500'
        }`}>
          {comment.length} / {LENGTH_LIMITS.REVIEW_COMMENT.MAX}
        </span>
      </div>
    </div>
  );
};

const ManagerReviewRegister: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { registerReview } = useReservation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 5,
    comment: '',
    preference: 'NONE', // 매니저 리뷰에서는 사용하지 않지만 타입 맞추기 위해 유지
  });

  const handleKeywordToggle = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : prev.length < 6 
          ? [...prev, keyword]
          : prev // 최대 6개까지만 허용
    );
  };

  const handleKeywordRemove = (keyword: string) => {
    setSelectedKeywords(prev => prev.filter(k => k !== keyword));
  };

  // 키워드가 선택되었으면 comment는 선택사항
  const hasSelectedKeywords = selectedKeywords.length > 0;
  const isCommentValid = hasSelectedKeywords || (
    formData.comment.length >= LENGTH_LIMITS.REVIEW_COMMENT.MIN && 
    formData.comment.length <= LENGTH_LIMITS.REVIEW_COMMENT.MAX
  );
  
  // 폼 유효성: 키워드가 있거나 코멘트가 유효해야 함
  const isFormValid = hasSelectedKeywords || isCommentValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      alert('예약 정보를 찾을 수 없습니다.');
      return;
    }

    if (!isFormValid) {
      alert('키워드를 선택하거나 리뷰를 작성해주세요.');
      return;
    }

    // 코멘트 길이 체크 (코멘트가 있는 경우에만)
    if (formData.comment.length > 0 && formData.comment.length < LENGTH_LIMITS.REVIEW_COMMENT.MIN) {
      alert(`리뷰는 ${LENGTH_LIMITS.REVIEW_COMMENT.MIN}자 이상 작성해주세요.`);
      return;
    }

    if (formData.comment.length > LENGTH_LIMITS.REVIEW_COMMENT.MAX) {
      alert(`리뷰는 ${LENGTH_LIMITS.REVIEW_COMMENT.MAX}자 이하로 작성해주세요.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const data: ReviewRegisterRequest = {
        rating: formData.rating,
        comment: formData.comment,
        keywords: selectedKeywords.length > 0 ? selectedKeywords : [''],
        // 매니저 리뷰에서는 likes 필드 제외
      };

      await registerReview(parseInt(id), data);
      alert('고객 리뷰가 등록되었습니다.');
      navigate(ROUTES.MANAGER.RESERVATIONS); // 매니저용 라우트로 변경 필요
    } catch (error) {
      alert('리뷰 등록에 실패했습니다.');
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
            <h1 className="text-xl font-bold text-gray-900">고객 리뷰 작성</h1>
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
              onChange={(rating) => setFormData((prev) => ({ ...prev, rating }))}
            />

            {/* 키워드 선택 */}
            <ManagerKeywordSelection
              rating={formData.rating}
              selectedKeywords={selectedKeywords}
              onKeywordToggle={handleKeywordToggle}
              onKeywordRemove={handleKeywordRemove}
            />

            {/* 직접 리뷰 작성 */}
            <ReviewTextArea
              comment={formData.comment}
              onChange={(comment) => setFormData((prev) => ({ ...prev, comment }))}
              isOptional={hasSelectedKeywords}
            />

            {/* 제출 버튼 */}
            <div className="pt-4 pb-8">
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`w-full py-4 rounded-2xl text-lg font-bold transition-all duration-200 focus:outline-none focus:ring-4 shadow-lg ${
                  isFormValid && !isSubmitting
                    ? 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-200 hover:shadow-xl hover:-translate-y-0.5'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                }`}
              >
                {isSubmitting ? '등록 중...' : '고객 리뷰 등록하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManagerReviewRegister;