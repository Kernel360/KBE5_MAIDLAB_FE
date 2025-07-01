import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  User,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Header } from '@/components';

import { ROUTES } from '@/constants';
import { useAuth, useReservation, useManager } from '@/hooks';
import { formatDate, formatTime } from '@/utils/date';
import { formatPrice } from '@/utils/format';
import { RESERVATION_STATUS } from '@/constants/status';
import { SERVICE_TYPE_LABELS } from '@/constants/service';
import type { ServiceType } from '@/constants/service';

const ManagerHome: React.FC = () => {
  const navigate = useNavigate();
  const { userType } = useAuth();
  const { reservations, loading, fetchReservations } = useReservation();
  const { profile, loading: profileLoading, fetchProfile } = useManager();

  // 캘린더 상태
  const [currentDate, setCurrentDate] = useState(new Date());

  // 오늘 날짜
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  // 매니저 전용 예약 필터링
  const managerReservations = reservations.filter(
    (reservation) => reservation.status !== RESERVATION_STATUS.CANCELED,
  );

  // 오늘의 예약
  const todayReservations = managerReservations.filter(
    (reservation) => reservation.reservationDate === todayString,
  );

  // 다가오는 예약 (가장 가까운 예약 1건)
  const upcomingReservations = managerReservations
    .filter((reservation) => {
      const reservationDateTime = new Date(
        `${reservation.reservationDate}T${reservation.startTime}`,
      );
      const now = new Date();
      return (
        reservationDateTime >= now &&
        (reservation.status === RESERVATION_STATUS.MATCHED ||
          reservation.status === RESERVATION_STATUS.PAID ||
          reservation.status === RESERVATION_STATUS.WORKING ||
          reservation.status === RESERVATION_STATUS.PENDING ||
          reservation.status === RESERVATION_STATUS.APPROVED)
      );
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.reservationDate}T${a.startTime}`);
      const dateB = new Date(`${b.reservationDate}T${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 1); // 가장 가까운 예약 1건만

  // 캘린더 네비게이션
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // 오늘로 돌아가기
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 현재 표시 중인 달이 오늘이 포함된 달인지 확인
  const isCurrentMonth =
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth() === today.getMonth();

  // 캘린더 날짜 생성
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dateString = current.toISOString().split('T')[0];

      // 예정된 예약만 필터링 (완료/취소 제외)
      const hasUpcomingReservation = managerReservations.some(
        (reservation) =>
          reservation.reservationDate === dateString &&
          (reservation.status === RESERVATION_STATUS.MATCHED ||
            reservation.status === RESERVATION_STATUS.PAID ||
            reservation.status === RESERVATION_STATUS.WORKING ||
            reservation.status === RESERVATION_STATUS.PENDING ||
            reservation.status === RESERVATION_STATUS.APPROVED),
      );

      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: current.toDateString() === today.toDateString(),
        hasReservation: hasUpcomingReservation,
        dateString,
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

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
  }, []);

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
          <section className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl p-6 text-white">
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
                <p className="text-gray-500 text-xs mb-1">제공 서비스</p>
                <p className="text-2xl font-bold text-green-500">
                  {profile?.services?.length || 0}
                </p>
                <p className="text-xs text-gray-400">개</p>
              </div>
            </div>
          </section>

          {/* 예약 일정 캘린더 */}
          <section className="bg-white rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">예약 일정</h2>
              <button
                onClick={() => navigate(ROUTES.MANAGER.RESERVATIONS)}
                className="text-orange-500 text-sm font-medium"
              >
                전체보기
              </button>
            </div>

            {/* 캘린더 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">
                {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
              </h3>
              <div className="flex items-center space-x-2">
                {/* 오늘 버튼 - 현재 달이 아닐 때만 표시 */}
                {!isCurrentMonth && (
                  <button
                    onClick={goToToday}
                    className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium hover:bg-orange-200 transition-colors"
                  >
                    오늘
                  </button>
                )}

                {/* 이전/다음 달 버튼 */}
                <div className="flex space-x-1">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                <div key={day} className="h-8 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-500">
                    {day}
                  </span>
                </div>
              ))}
            </div>

            {/* 캘린더 그리드 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  className={`
                    h-10 flex items-center justify-center text-sm relative
                    ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}
                    ${day.isToday ? 'bg-orange-500 text-white rounded-full font-medium' : ''}
                    ${day.hasReservation && !day.isToday ? 'bg-orange-100 rounded-full' : ''}
                    hover:bg-gray-100 transition-colors
                  `}
                >
                  {day.date.getDate()}
                  {day.hasReservation && !day.isToday && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-orange-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* 다가오는 예약 */}
          <section className="bg-white rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">다음 예약</h2>
              <button
                onClick={() => navigate(ROUTES.MANAGER.RESERVATIONS)}
                className="text-orange-500 text-sm font-medium"
              >
                전체보기
              </button>
            </div>

            {loading ? (
              <div className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded-xl" />
              </div>
            ) : upcomingReservations.length > 0 ? (
              <div>
                {upcomingReservations.map((reservation) => {
                  const reservationDateTime = new Date(
                    `${reservation.reservationDate}T${reservation.startTime}`,
                  );
                  const now = new Date();
                  const timeDiff =
                    reservationDateTime.getTime() - now.getTime();
                  const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                  const hoursUntil = Math.ceil(timeDiff / (1000 * 60 * 60));

                  let timeUntilText = '';
                  if (daysUntil > 1) {
                    timeUntilText = `${daysUntil}일 후`;
                  } else if (hoursUntil > 1) {
                    timeUntilText = `${hoursUntil}시간 후`;
                  } else {
                    timeUntilText = '곧 시작';
                  }

                  return (
                    <button
                      key={reservation.reservationId}
                      onClick={() =>
                        handleReservationClick(reservation.reservationId)
                      }
                      className="w-full bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 text-left hover:from-orange-100 hover:to-orange-200 transition-all border border-orange-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                          <span className="text-orange-600 font-semibold text-sm">
                            {timeUntilText}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}
                        >
                          {getStatusText(reservation.status)}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 text-lg mb-2">
                        {reservation.detailServiceType ||
                          reservation.serviceType ||
                          '가사도우미'}{' '}
                        서비스
                      </h3>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                          <span className="font-medium">
                            {formatDate(reservation.reservationDate)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-orange-500" />
                          <span>
                            {formatTime(reservation.startTime)} -{' '}
                            {formatTime(reservation.endTime)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                          <span className="truncate">서울시 강남구</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-orange-200">
                        <span className="text-orange-600 font-bold text-lg">
                          {formatPrice(reservation.totalPrice)}
                        </span>
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
