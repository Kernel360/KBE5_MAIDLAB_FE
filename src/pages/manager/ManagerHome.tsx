import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Header } from '@/components';
import WeeklySettlementChart from '@/components/features/manager/WeeklySettlementChart';

import { ROUTES } from '@/constants';
import { useAuth, useReservation, useManager } from '@/hooks';
import { formatDate, formatTime, safeCreateDateTime } from '@/utils/date';
import { formatPrice } from '@/utils/format';
import { RESERVATION_STATUS } from '@/constants/status';
import { SERVICE_TYPE_LABELS } from '@/constants/service';
import type { ServiceType } from '@/constants/service';

const ManagerHome: React.FC = () => {
  const navigate = useNavigate();
  const { userType } = useAuth();
  const { reservations, loading, fetchReservations, fetchWeeklySettlements } =
    useReservation();
  const {
    profile,
    loading: profileLoading,
    fetchProfile,
    fetchMyReviews,
  } = useManager();

  // 리뷰 데이터 상태
  const [reviewData, setReviewData] = useState<any>(null);
  // 주간 정산 데이터 상태
  const [weeklySettlements, setWeeklySettlements] = useState<any[]>([]);

  // 오늘 날짜
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  // 매니저 전용 예약 필터링
  const managerReservations = reservations.filter(
    (reservation) => reservation.status !== RESERVATION_STATUS.CANCELED,
  );

  // 디버깅을 위한 로그 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    console.log('Manager 예약 데이터:', {
      총예약수: reservations.length,
      유효예약수: managerReservations.length,
      예약목록: managerReservations.length > 0 ? managerReservations.slice(0, 2) : []
    });
  }

  // 오늘의 예약
  const todayReservations = managerReservations.filter(
    (reservation) => reservation.reservationDate === todayString,
  );

  // 다가오는 예약 (가장 가까운 예약 1건)
  console.log('예약 데이터 샘플:', managerReservations[0]);
  const upcomingReservations = managerReservations
    .filter((reservation) => {
      // 날짜만 비교 (오늘 이후의 예약) 또는 오늘 예약 중 시간이 남은 것
      const reservationDate = reservation.reservationDate.split(' ')[0];
      const now = new Date();
      const nowDateString = now.toISOString().split('T')[0];

      // 오늘 이후 날짜의 예약
      if (reservationDate > nowDateString) {
        return (
          reservation.status === RESERVATION_STATUS.MATCHED ||
          reservation.status === RESERVATION_STATUS.WORKING ||
          reservation.status === RESERVATION_STATUS.PENDING ||
          reservation.status === RESERVATION_STATUS.APPROVED
        );
      }

      // 오늘 날짜의 예약 중 시간이 남은 것
      if (reservationDate === nowDateString) {
        const reservationDateTime = safeCreateDateTime(
          reservationDate,
          reservation.startTime,
        );
        const isValidTime = reservationDateTime !== null;
        const isFuture = reservationDateTime ? reservationDateTime >= now : false;
        const isValidStatus = (
          reservation.status === RESERVATION_STATUS.MATCHED ||
          reservation.status === RESERVATION_STATUS.WORKING ||
          reservation.status === RESERVATION_STATUS.PENDING ||
          reservation.status === RESERVATION_STATUS.APPROVED
        );
        
        return isValidTime && isFuture && isValidStatus;
      }

      return false;
    })
    .sort((a, b) => {
      const dateA = safeCreateDateTime(a.reservationDate.split(' ')[0], a.startTime);
      const dateB = safeCreateDateTime(b.reservationDate.split(' ')[0], b.startTime);
      
      if (!dateA || !dateB) return 0;
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 1); // 가장 가까운 예약 1건만
  
  console.log('필터링된 다가오는 예약:', upcomingReservations);

  // 예약 상태별 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case RESERVATION_STATUS.MATCHED:
        return 'bg-blue-100 text-blue-600';
      case RESERVATION_STATUS.PAID:
        return 'bg-teal-100 text-teal-600';
      case RESERVATION_STATUS.WORKING:
        return 'bg-green-100 text-green-600';
      case RESERVATION_STATUS.COMPLETED:
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-orange-100 text-orange-600';
    }
  };

  // 예약 상태별 텍스트
  const getStatusText = (status: string) => {
    switch (status) {
      case RESERVATION_STATUS.MATCHED:
        return '미결제';
      case RESERVATION_STATUS.PAID:
        return '예정';
      case RESERVATION_STATUS.WORKING:
        return '진행중';
      case RESERVATION_STATUS.COMPLETED:
        return '완료';
      default:
        return '대기';
    }
  };

  const handleReservationClick = (reservationId: number) => {
    navigate(`${ROUTES.MANAGER.RESERVATIONS}/${reservationId}`);
  };

  const handleNotificationClick = () => {
    console.log('알림 클릭');
  };

  useEffect(() => {
    fetchReservations();
    fetchProfile(); // 매니저 프로필 정보 가져오기
    loadReviews(); // 리뷰 데이터 가져오기
    loadWeeklySettlements(); // 주간 정산 데이터 가져오기
  }, []);

  // 리뷰 데이터 로드
  const loadReviews = async () => {
    try {
      const data = await fetchMyReviews();
      if (data) {
        setReviewData(data);
      }
    } catch (error) {
      console.error('리뷰 데이터 로드 실패:', error);
    }
  };

  // 주간 정산 데이터 로드
  const loadWeeklySettlements = async () => {
    try {
      const weeklyData = [];
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      // 이번 달의 첫째 주부터 마지막 주까지 계산
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

      // 월요일 기준으로 주 계산
      let currentWeekStart = new Date(firstDayOfMonth);
      currentWeekStart.setDate(
        currentWeekStart.getDate() - ((currentWeekStart.getDay() + 6) % 7),
      );

      let weekNumber = 1;

      while (currentWeekStart <= lastDayOfMonth) {
        const weekStartString = currentWeekStart.toISOString().split('T')[0];

        try {
          const data = await fetchWeeklySettlements(weekStartString);
          weeklyData.push({
            week: weekNumber,
            startDate: new Date(currentWeekStart),
            totalAmount: data?.totalAmount || 0,
            settlementsCount: data?.settlements?.length || 0,
          });
        } catch (error) {
          // 데이터가 없는 주는 0으로 처리
          weeklyData.push({
            week: weekNumber,
            startDate: new Date(currentWeekStart),
            totalAmount: 0,
            settlementsCount: 0,
          });
        }

        // 다음 주로 이동
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        weekNumber++;

        // 최대 5주까지만
        if (weekNumber > 5) break;
      }

      setWeeklySettlements(weeklyData);
    } catch (error) {
      console.error('주간 정산 데이터 로드 실패:', error);
    }
  };

  // 평균 평점 계산
  const calculateAverageRating = () => {
    const reviews = reviewData?.reviews || [];
    if (reviews.length === 0) return 0;

    const totalRating = reviews.reduce(
      (sum: number, review: any) => sum + Number(review.rating),
      0,
    );
    return Number((totalRating / reviews.length).toFixed(1));
  };

  const averageRating = calculateAverageRating();

  if (userType !== 'MANAGER') {
    navigate(ROUTES.HOME);
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showNotification={true}
        onNotificationClick={handleNotificationClick}
      />

      <main className="px-4 py-6 pb-20 pt-20">
        <div className="max-w-md mx-auto space-y-6">
          {/* 매니저 프로필 섹션 */}
          <section
            className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl p-6 text-white cursor-pointer hover:from-orange-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            onClick={() => navigate(ROUTES.MANAGER.MYPAGE)}
          >
            {profileLoading ? (
              // 로딩 상태
              <div className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-6 bg-white/20 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-white/20 rounded w-32"></div>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-full"></div>
                </div>
                <div className="mt-4 flex items-center space-x-4">
                  <div className="h-6 bg-white/20 rounded w-20"></div>
                  <div className="h-4 bg-white/20 rounded w-16"></div>
                </div>
              </div>
            ) : (
              // 실제 매니저 정보
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-bold mb-1">
                      {profile?.name || '매니저'}님, 좋은 아침이에요!
                    </h1>
                    <p className="text-orange-100 text-sm">
                      승인 상태:{' '}
                      {profile?.isVerified ? '활동 가능' : '승인 대기중'}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                    {profile?.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt={`${profile.name} 프로필`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // 이미지 로드 실패시 기본 아이콘 표시
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget
                            .nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <User
                      className="w-7 h-7"
                      style={{
                        display: profile?.profileImage ? 'none' : 'block',
                      }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center space-x-4">
                  <div className="bg-white/20 rounded-xl px-3 py-1">
                    <span className="text-sm">
                      {profile?.services
                        ?.map(
                          (service) =>
                            SERVICE_TYPE_LABELS[service as ServiceType] ||
                            service,
                        )
                        .join(', ') || '가사도우미'}
                    </span>
                  </div>
                  {profile?.schedules && profile.schedules.length > 0 && (
                    <span className="text-sm text-orange-100">
                      주{' '}
                      {
                        new Set(
                          profile.schedules.map((schedule) => schedule.day),
                        ).size
                      }
                      일 근무
                    </span>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* 간단한 통계 정보 */}
          <section className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              이번 달 활동
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-500 text-xs mb-1">이번 달 예약</p>
                <p className="text-2xl font-bold text-orange-500">
                  {
                    managerReservations.filter((r) => {
                      const reservationMonth = new Date(
                        r.reservationDate,
                      ).getMonth();
                      return reservationMonth === today.getMonth();
                    }).length
                  }
                </p>
                <p className="text-xs text-gray-400">건</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">총 완료</p>
                <p className="text-2xl font-bold text-blue-500">
                  {
                    managerReservations.filter(
                      (r) => r.status === RESERVATION_STATUS.COMPLETED,
                    ).length
                  }
                </p>
                <p className="text-xs text-gray-400">건</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">평균 평점</p>
                <p className="text-2xl font-bold text-green-500">
                  {averageRating > 0 ? averageRating : '-'}
                </p>
                <p className="text-xs text-gray-400">점</p>
              </div>
            </div>
          </section>

          {/* 이번달 주간별 정산 */}
          <section className="bg-white rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                이번 달 주간별 정산
              </h2>
              <button
                onClick={() => navigate(ROUTES.MANAGER.SETTLEMENTS)}
                className="text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors"
              >
                상세보기 →
              </button>
            </div>

            {/* 주간별 정산 그래프 */}
            <WeeklySettlementChart weeklySettlements={weeklySettlements} />
          </section>

          {/* 가까운 예약 */}
          <section className="bg-white rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">가까운 예약</h2>
              <button
                onClick={() => navigate(ROUTES.MANAGER.RESERVATIONS)}
                className="text-orange-500 text-sm font-medium"
              >
                전체보기 →
              </button>
            </div>

            {loading ? (
              <div className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded-xl" />
              </div>
            ) : upcomingReservations.length > 0 ? (
              <div className="space-y-3">
                {upcomingReservations.map((reservation) => {
                  // 날짜에서 YYYY-MM-DD 부분만 추출
                  const dateOnly = reservation.reservationDate.split(' ')[0];
                  const reservationDateTime = safeCreateDateTime(
                    dateOnly,
                    reservation.startTime,
                  );
                  const now = new Date();
                  
                  let timeUntilText = '시간 미정';
                  
                  if (reservationDateTime) {
                    const timeDiff = reservationDateTime.getTime() - now.getTime();
                    const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                    const hoursUntil = Math.ceil(timeDiff / (1000 * 60 * 60));

                    if (daysUntil > 1) {
                      timeUntilText = `${daysUntil}일 후`;
                    } else if (hoursUntil > 1) {
                      timeUntilText = `${hoursUntil}시간 후`;
                    } else if (timeDiff > 0) {
                      timeUntilText = '곧 시작';
                    } else {
                      timeUntilText = '진행 중';
                    }
                  }

                  return (
                    <button
                      key={reservation.reservationId}
                      onClick={() =>
                        handleReservationClick(reservation.reservationId)
                      }
                      className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-orange-300 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-orange-600 font-medium text-sm">
                            {timeUntilText}
                          </span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}
                        >
                          {getStatusText(reservation.status)}
                        </span>
                      </div>

                      <h3 className="font-semibold text-gray-900 text-base mb-3">
                        {reservation.detailServiceType ||
                          reservation.serviceType ||
                          '가사도우미'}{' '}
                        서비스
                      </h3>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span>
                            {formatDate(reservation.reservationDate) || '날짜 미정'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          <span>
                            {reservation.startTime} - {reservation.endTime}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-orange-600 font-semibold text-lg">
                          {formatPrice(reservation.totalPrice)}
                        </span>
                        <div className="text-xs text-gray-500">
                          자세히 보기 →
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-base font-medium mb-2">
                  다음 예약이 없습니다
                </p>
                <p className="text-sm text-gray-400">
                  새로운 예약 요청을 기다리고 있어요
                </p>
              </div>
            )}
          </section>

          {/* 오늘의 작업 요약 */}
          {todayReservations.length > 0 && (
            <section className="bg-blue-50 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                오늘의 일정
              </h2>
              <div className="space-y-3">
                {todayReservations.map((reservation) => (
                  <div
                    key={reservation.reservationId}
                    className="bg-white rounded-xl p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          reservation.status === RESERVATION_STATUS.WORKING
                            ? 'bg-green-500'
                            : reservation.status ===
                                RESERVATION_STATUS.COMPLETED
                              ? 'bg-gray-500'
                              : 'bg-blue-500'
                        }`}
                      />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {formatTime(reservation.startTime)}
                        </p>
                        <p className="text-gray-600 text-xs">
                          {reservation.detailServiceType ||
                            reservation.serviceType ||
                            '가사도우미'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {reservation.status === RESERVATION_STATUS.WORKING && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                      {reservation.status === RESERVATION_STATUS.MATCHED && (
                        <AlertCircle className="w-4 h-4 text-blue-500" />
                      )}
                      {reservation.status === RESERVATION_STATUS.PAID && (
                        <CheckCircle2 className="w-4 h-4 text-teal-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManagerHome;
