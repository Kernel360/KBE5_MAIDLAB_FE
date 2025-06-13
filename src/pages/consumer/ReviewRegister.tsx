import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useReservation } from '@/hooks/useReservation';
import { ROUTES } from '@/constants';
import { LENGTH_LIMITS } from '@/constants/validation';
import type { ReviewRegisterRequestDto } from '@/apis/reservation';

// 선호도 타입 정의
type PreferenceType = 'LIKE' | 'BLACKLIST' | 'NONE';

// 리뷰 폼 데이터 타입 정의
interface ReviewFormData {
  rating: number;
  comment: string;
  preference: PreferenceType;
}

// 별점 컴포넌트
const RatingStars: React.FC<{
  rating: number;
  onChange: (rating: number) => void;
}> = ({ rating, onChange }) => (
  <div>
    <label className="block text-lg font-medium mb-2">
      서비스는 어떠셨나요?
    </label>
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-3xl ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          ★
        </button>
      ))}
    </div>
    <span className="block mt-2 text-xl font-medium">
      {rating}.0
    </span>
  </div>
);

// 리뷰 내용 컴포넌트
const ReviewComment: React.FC<{
  comment: string;
  onChange: (comment: string) => void;
}> = ({ comment, onChange }) => (
  <div>
    <label className="block text-lg font-medium mb-2">
      리뷰 내용
    </label>
    <textarea
      value={comment}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-32 p-3 border rounded-lg resize-none"
      placeholder={`최소 ${LENGTH_LIMITS.REVIEW_COMMENT.MIN}자 이상 작성해주세요.`}
    />
    <span className="block mt-1 text-sm text-gray-500">
      {comment.length} / {LENGTH_LIMITS.REVIEW_COMMENT.MAX}자
    </span>
  </div>
);

// 도우미 선호도 선택 컴포넌트
const PreferenceButtons: React.FC<{
  preference: PreferenceType;
  onChange: (preference: PreferenceType) => void;
}> = ({ preference, onChange }) => (
  <div>
    <label className="block text-lg font-medium mb-4">
      이 도우미를 어떻게 관리하시겠어요?
    </label>
    <div className="flex gap-4">
      <button
        type="button"
        onClick={() => onChange('LIKE')}
        className={`flex-1 py-3 rounded-lg border ${
          preference === 'LIKE'
            ? 'bg-orange-50 border-orange-500 text-orange-500'
            : 'border-gray-300'
        }`}
      >
        <span className="text-2xl">♥</span>
        <span className="block mt-1">찜하기</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('BLACKLIST')}
        className={`flex-1 py-3 rounded-lg border ${
          preference === 'BLACKLIST'
            ? 'bg-red-50 border-red-500 text-red-500'
            : 'border-gray-300'
        }`}
      >
        <span className="text-2xl">⛔</span>
        <span className="block mt-1">블랙리스트</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('NONE')}
        className={`flex-1 py-3 rounded-lg border ${
          preference === 'NONE'
            ? 'bg-gray-50 border-gray-500 text-gray-500'
            : 'border-gray-300'
        }`}
      >
        <span className="text-2xl">✕</span>
        <span className="block mt-1">선택없음</span>
      </button>
    </div>
  </div>
);

const ReviewRegister: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { registerReview } = useReservation();
  
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 5,
    comment: '',
    preference: 'NONE',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      alert('예약 정보를 찾을 수 없습니다.');
      return;
    }

    if (formData.comment.length < LENGTH_LIMITS.REVIEW_COMMENT.MIN || 
        formData.comment.length > LENGTH_LIMITS.REVIEW_COMMENT.MAX) {
      alert(`리뷰는 ${LENGTH_LIMITS.REVIEW_COMMENT.MIN}자 이상 ${LENGTH_LIMITS.REVIEW_COMMENT.MAX}자 이하로 작성해주세요.`);
      return;
    }

    try {
      const data: ReviewRegisterRequestDto = {
        rating: formData.rating,
        comment: formData.comment,
        ...(formData.preference !== 'NONE' && {
          likes: formData.preference === 'LIKE',
        }),
      };

      await registerReview(parseInt(id), data);
      alert('리뷰가 등록되었습니다.');
      navigate(ROUTES.CONSUMER.RESERVATIONS);
    } catch (error) {
      alert('리뷰 등록에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600"
        >
          <span className="mr-2">←</span>
          뒤로가기
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6">리뷰 작성</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <RatingStars
          rating={formData.rating}
          onChange={(rating) => setFormData((prev) => ({ ...prev, rating }))}
        />

        <ReviewComment
          comment={formData.comment}
          onChange={(comment) => setFormData((prev) => ({ ...prev, comment }))}
        />

        <PreferenceButtons
          preference={formData.preference}
          onChange={(preference) => setFormData((prev) => ({ ...prev, preference }))}
        />

        <button
          type="submit"
          className="w-full py-4 bg-orange-500 text-white rounded-lg text-lg font-medium hover:bg-orange-600"
        >
          리뷰 등록하기
        </button>
      </form>
    </div>
  );
};

export default ReviewRegister;
