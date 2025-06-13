import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { useReservation } from '@/hooks/useReservation';
import { ROUTES } from '@/constants/route';
import { NUMBER_LIMITS } from '@/constants/validation';
import type { ReservationDetailResponseDto } from '@/apis/reservation';

const ReviewRegister: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { fetchReservationDetail, registerReview } = useReservation();
  const [loading, setLoading] = useState(true);
  const [reservation, setReservation] = useState<ReservationDetailResponseDto | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReservation = async () => {
      if (!id) return;
      try {
        const data = await fetchReservationDetail(parseInt(id));
        if (!data) {
          throw new Error('예약 정보를 찾을 수 없습니다.');
        }
        setReservation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '예약 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadReservation();
  }, [id, fetchReservationDetail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !reservation) return;

    try {
      const result = await registerReview(parseInt(id), {
        rating,
        comment,
      });

      if (result.success) {
        navigate(ROUTES.MANAGER.RESERVATIONS);
      }
    } catch (error) {
      console.error('리뷰 등록 실패:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-red-500 mb-4">{error || '예약 정보를 찾을 수 없습니다.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow">
        <div className="flex items-center px-4 h-14">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2"
          >
            <IoArrowBack className="w-6 h-6" />
          </button>
          <h1 className="ml-2 text-lg font-semibold">리뷰 작성</h1>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="pt-16 pb-4">
        {/* 예약 정보 */}
        <div className="bg-white px-4 py-5">
          <h3 className="text-lg font-medium mb-4">예약 정보</h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-500 text-sm">서비스</p>
              <p className="mt-1">{reservation.serviceType} → {reservation.serviceDetailType}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">고객 이름</p>
              <p className="mt-1">{reservation.managerName}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">주소</p>
              <p className="mt-1">{reservation.address}</p>
              <p className="text-gray-500">{reservation.addressDetail}</p>
            </div>
          </div>
        </div>

        {/* 리뷰 작성 폼 */}
        <form onSubmit={handleSubmit} className="mt-2 bg-white px-4 py-5">
          <h3 className="text-lg font-medium mb-4">리뷰 작성</h3>
          
          {/* 별점 */}
          <div className="mb-6">
            <p className="text-gray-500 text-sm mb-2">별점</p>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-2xl focus:outline-none"
                >
                  <span className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
                    ★
                  </span>
                </button>
              ))}
              <span className="ml-2 text-lg font-medium">{rating}.0</span>
            </div>
          </div>

          {/* 리뷰 내용 */}
          <div className="mb-6">
            <p className="text-gray-500 text-sm mb-2">리뷰 내용</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="서비스는 어떠셨나요? 다른 매니저님들에게 도움이 될 수 있는 솔직한 리뷰를 남겨주세요."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
              maxLength={500}
            />
            <p className="text-right text-gray-500 text-sm mt-1">
              {comment.length}/500
            </p>
          </div>
        </form>
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <button
          onClick={handleSubmit}
          disabled={!comment.trim()}
          className={`w-full px-4 py-3 rounded-lg ${
            comment.trim()
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          리뷰 등록하기
        </button>
      </div>
    </div>
  );
};

export default ReviewRegister; 