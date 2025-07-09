import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../apis/admin';
import type { AdminManagerDetail } from '@/types/domain/admin';
import { useAdmin } from '@/hooks';
import { getServiceTypeName } from '@/utils/format';

const ManagerDetail = () => {
  const { reservationManagement } = useAdmin();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [managerData, setManagerData] = useState<AdminManagerDetail | null>(
    null,
  );
  const [recentReservations, setRecentReservations] = useState<any[]>([]);
  const [totalReservations, setTotalReservations] = useState<number>(0);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [matchingRate, setMatchingRate] = useState<number>(0);
  const [profileImageError, setProfileImageError] = useState<boolean>(false);

  useEffect(() => {
    const fetchManagerData = async () => {
      try {
        if (!id) return;
        const response = await adminApi.getManager(parseInt(id));
        setManagerData(response as unknown as AdminManagerDetail);
        // Reset profile image error state when loading new manager data
        setProfileImageError(false);

        // 총 매칭 건수 조회
        const matchedCount = await (adminApi as any).getMatchedCount(
          parseInt(id),
        );
        setTotalReservations(matchedCount);

        // 총 수익 금액 조회
        const settlementSum = await (adminApi as any).getManagerSettlementSum(
          parseInt(id),
        );
        setTotalEarnings(settlementSum);

        // 리뷰 작성률 조회 (temporarily using type assertion until TS recognizes the function)
        const reviewPercent = await (adminApi as any).getManagerReviewPercent(
          parseInt(id),
        );
        setMatchingRate(reviewPercent);

        // 최근 예약 데이터 조회 (moved inside try-catch to prevent infinite retry)
        await getRecentReservations();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : '데이터를 불러오는데 실패했습니다.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchManagerData();
  }, [id]);

  const getRecentReservations = async () => {
    if (!id) return;

    try {
      const params = {
        page: 0,
        size: 5,
      };

      const reservations = await reservationManagement.fetchManagerReservation(
        parseInt(id),
        params,
      );
      setRecentReservations(reservations || []);
    } catch (err) {
      console.error('Failed to fetch recent reservations:', err);
      // Set empty array instead of throwing error to prevent infinite retry
      setRecentReservations([]);
    }
  };

  const handleApprove = async () => {
    try {
      if (!id) return;
      await adminApi.approveManager(parseInt(id));
      const response = await adminApi.getManager(parseInt(id));
      setManagerData(response as unknown as AdminManagerDetail);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '승인 처리에 실패했습니다.',
      );
    }
  };

  const handleReject = async () => {
    try {
      if (!id) return;
      await adminApi.rejectManager(parseInt(id));
      const response = await adminApi.getManager(parseInt(id));
      setManagerData(response as unknown as AdminManagerDetail);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '거절 처리에 실패했습니다.',
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => navigate(-1)}
        >
          돌아가기
        </button>
      </div>
    );
  }

  if (!managerData) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-medium">
            매니저를 찾을 수 없습니다.
          </p>
        </div>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => navigate(-1)}
        >
          돌아가기
        </button>
      </div>
    );
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '승인 대기';
      case 'APPROVED':
        return '승인 완료';
      case 'REJECTED':
        return '승인 거절';
      default:
        return '알 수 없음';
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">매니저 상세 정보</h1>
          <p className="text-gray-600 text-sm mt-1">매니저 ID: {id}</p>
        </div>
        <button
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-700 font-medium"
          onClick={() => navigate(-1)}
        >
          목록으로
        </button>
      </div>

      {/* 삭제된 계정 알림 */}
      {managerData.isDeleted && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-red-500 mr-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-red-800 font-medium">⚠️ 삭제된 계정입니다</p>
          </div>
        </div>
      )}

      {/* 승인 처리 알림 */}
      {managerData.isVerified === 'PENDING' && !managerData.isDeleted && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-yellow-500 mr-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-yellow-800 font-medium">
                ⏳ 승인 대기 중인 매니저입니다
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                onClick={handleApprove}
              >
                승인
              </button>
              <button
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                onClick={handleReject}
              >
                거절
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 상단 요약 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-blue-800 font-semibold text-sm">승인 상태</div>
          <div className="text-2xl font-bold text-blue-900">
            {getStatusText(managerData.isVerified)}
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-green-800 font-semibold text-sm">
            총 매칭 건수
          </div>
          <div className="text-2xl font-bold text-green-900">
            {totalReservations}건
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-purple-800 font-semibold text-sm">
            총 수익 금액
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {totalEarnings.toLocaleString()}원
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="text-orange-800 font-semibold text-sm">
            리뷰 작성률
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {matchingRate}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측: 프로필 정보 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 프로필 카드 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              기본 정보
            </h3>

            <div className="flex items-center space-x-4 mb-6">
              {managerData.profileImage && !profileImageError ? (
                <img
                  className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                  src={managerData.profileImage}
                  alt={`${managerData.name}의 프로필`}
                  onError={() => {
                    // Set error state to prevent infinite retry
                    setProfileImageError(true);
                  }}
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {managerData.name}
                  </h2>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      managerData.isVerified === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : managerData.isVerified === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {getStatusText(managerData.isVerified)}
                  </span>
                  {managerData.isDeleted && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      삭제됨
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">성별</span>
                <span className="text-gray-900">
                  {managerData.gender === 'MALE' ? '남성' : '여성'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">생년월일</span>
                <span className="text-gray-900">{managerData.birth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">계정 유형</span>
                <span className="text-gray-900">
                  {managerData.socialType ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {managerData.socialType === 'GOOGLE'
                        ? '구글'
                        : managerData.socialType}
                    </span>
                  ) : (
                    '일반 계정'
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">연락처</span>
                <span className="text-gray-900">
                  {managerData.phoneNumber || '소셜 로그인'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">가입일</span>
                <span className="text-gray-900">
                  {formatDate(managerData.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* 활동 지역 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              활동 지역
            </h3>
            <div className="flex flex-wrap gap-2">
              {managerData.region.map((region, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {region}
                </span>
              ))}
            </div>
          </div>

          {/* 자기소개 */}
          {managerData.introduceText && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                자기소개
              </h3>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
                  {managerData.introduceText}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 우측: 예약 기록 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              최근 매칭 기록 (최대 5건 조회)
            </h3>

            {recentReservations.length > 0 ? (
              <div className="space-y-4">
                {recentReservations.map((reservation, index) => (
                  <div
                    key={reservation.reservationId || index}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/admin/reservations/${reservation.reservationId}`,
                      )
                    }
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-500 text-sm font-mono">
                          #{reservation.reservationId}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            reservation.status === 'CONFIRMED'
                              ? 'bg-green-100 text-green-800'
                              : reservation.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : reservation.status === 'CANCELLED'
                                  ? 'bg-red-100 text-red-800'
                                  : reservation.status === 'COMPLETED'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {reservation.status === 'CONFIRMED'
                            ? '확정'
                            : reservation.status === 'PENDING'
                              ? '대기중'
                              : reservation.status === 'CANCELLED'
                                ? '취소됨'
                                : reservation.status === 'COMPLETED'
                                  ? '완료'
                                  : reservation.status}
                        </span>
                        {reservation.isExistReview && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            리뷰 완료
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {reservation.totalPrice.toLocaleString()}원
                        </div>
                      </div>
                    </div>

                    <div className="mb-2">
                      <h4 className="font-semibold text-gray-900 text-base">
                        {getServiceTypeName(reservation.serviceType)} -{' '}
                        {reservation.detailServiceType}
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 font-medium">
                          예약 날짜:
                        </span>
                        <div className="text-gray-900 font-medium">
                          {reservation.reservationDate}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 font-medium">
                          서비스 시간:
                        </span>
                        <div className="text-gray-900 font-medium">
                          {reservation.startTime} - {reservation.endTime}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-12 text-center">
                <svg
                  className="h-12 w-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-500 font-medium text-lg">
                  매칭 기록이 없습니다
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  아직 매칭된 서비스가 없습니다
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDetail;
