import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, HeroSection } from '@/components';
import { ROUTES } from '@/constants';
import { useAuth, useUser, useEvent } from '@/hooks';
import { reservationApi } from '@/apis/reservation';
import { RESERVATION_STATUS_LABELS } from '@/constants/status';
import { SERVICE_TYPE_LABELS } from '@/constants/service';

const ConsumerMain: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { profile, fetchProfile } = useUser();
  const { activeEvents, loading: eventsLoading } = useEvent();

  const [recentReservation, setRecentReservation] = useState<null | {
    reservationId: number;
    serviceType: string;
    reservationDate: string;
    address: string;
    addressDetail: string;
    status: string;
  }>(null);

  // 프로필 호출
  useEffect(() => {
    fetchProfile();
  }, []);

  // 최근 예약 정보 조회
  useEffect(() => {
    (async () => {
      try {
        const reservations = await reservationApi.getAllReservations();
        if (reservations && reservations.length > 0) {
          const today = new Date();
          // 예약일 기준으로 오늘 또는 미래 예약만 필터링
          const upcoming = reservations.filter((r) => {
            const date = new Date(r.reservationDate.replace(' ', 'T'));
            // 시/분까지 비교하려면 date >= today
            return (
              date >=
              new Date(today.getFullYear(), today.getMonth(), today.getDate())
            );
          });
          let target;
          if (upcoming.length > 0) {
            // 가까운 미래 예약 중 가장 빠른 것
            target = upcoming.sort((a, b) => {
              const dateA = new Date(a.reservationDate.replace(' ', 'T'));
              const dateB = new Date(b.reservationDate.replace(' ', 'T'));
              return dateA.getTime() - dateB.getTime();
            })[0];
          } else {
            // 과거 예약 중 가장 최근 것
            target = reservations.sort((a, b) => {
              const dateA = new Date(a.reservationDate.replace(' ', 'T'));
              const dateB = new Date(b.reservationDate.replace(' ', 'T'));
              return dateB.getTime() - dateA.getTime();
            })[0];
          }
          const detail = await reservationApi.getReservationDetail(
            target.reservationId,
          );
          setRecentReservation({
            reservationId: target.reservationId,
            serviceType: target.serviceType,
            reservationDate: target.reservationDate,
            address: detail.address,
            addressDetail: detail.addressDetail,
            status: target.status,
          });
        } else {
          setRecentReservation(null);
        }
      } catch {
        setRecentReservation(null);
      }
    })();
  }, []);

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    let [date, time] = dateStr.split(' ');
    if (!time && dateStr.includes('T')) [date, time] = dateStr.split('T');
    if (!date || !time) return dateStr;
    const [year, month, day] = date.split('-');
    let [hour, minute] = time.split(':');
    let h = parseInt(hour, 10);
    const ampm = h < 12 ? '오전' : '오후';
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return `${year}.${month}.${day} ${ampm} ${h}:${minute}`;
  };

  const handleServiceClick = (serviceType: string) => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    navigate(ROUTES.CONSUMER.RESERVATION_CREATE, {
      state: { serviceType },
    });
  };

  const handleEventClick = (eventId: number) => {
    navigate(`${ROUTES.EVENTS}/${eventId}`);
  };

  const handleNotificationClick = () => {
    // 알림 기능 준비 중 메시지 또는 알림 페이지로 이동
    console.log('알림 클릭');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        showNotification={true}
        onNotificationClick={handleNotificationClick}
      />

      <main className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <HeroSection
            onEventClick={handleEventClick}
            events={activeEvents}
            loading={eventsLoading}
          />
          {/* Greeting + Service Button Card (색상 스왑) */}
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 bg-opacity-90 rounded-2xl p-6 text-orange-600 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold mb-1 text-black dark:text-white">
                    {profile?.name
                      ? `${profile.name}님, 반가워요!`
                      : '환영합니다!'}
                  </h1>
                  <p className="text-sm text-black dark:text-gray-300">
                    {profile?.name
                      ? '오늘도 좋은 하루 보내세요.'
                      : '서비스를 신청해보세요.'}
                  </p>
                </div>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center overflow-hidden">
                  {profile?.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt="프로필"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget
                          .nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <svg
                    className="w-7 h-7"
                    style={{
                      display: profile?.profileImage ? 'none' : 'block',
                    }}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-6 flex flex-col items-center">
                <button
                  onClick={() => handleServiceClick('ALL')}
                  className="w-full flex flex-col items-center justify-center bg-[#FF6B00] rounded-xl shadow p-3 hover:bg-[#ea580c] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-orange-100 text-white"
                >
                  <span className="mb-1"></span>
                  <span className="text-base font-bold text-white">
                    예약하기
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="recent-reservation-card">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">최근 예약</h2>
              <button
                className="text-sm text-orange-500 font-medium hover:underline ml-4"
                onClick={() => navigate(ROUTES.CONSUMER.RESERVATIONS)}
              >
                더보기
              </button>
            </div>
            <hr className="border-t border-gray-200 dark:border-gray-600 mb-2" />
            <div
              className="flex justify-between items-start cursor-pointer rounded-lg transition-colors duration-150 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 hover:border-orange-400 hover:shadow-lg"
              role="button"
              tabIndex={0}
              onClick={() => {
                if (recentReservation) {
                  navigate(
                    `/consumer/reservations/${recentReservation.reservationId}`,
                  );
                }
              }}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && recentReservation) {
                  navigate(
                    `/consumer/reservations/${recentReservation.reservationId}`,
                  );
                }
              }}
            >
              <div className="flex-1 flex flex-col gap-2">
                {recentReservation ? (
                  <>
                    <div>
                      <span className="recent-reservation-label">
                        서비스 종류:{' '}
                      </span>
                      <span className="recent-reservation-value">
                        {SERVICE_TYPE_LABELS[
                          recentReservation.serviceType as keyof typeof SERVICE_TYPE_LABELS
                        ] || recentReservation.serviceType}
                      </span>
                    </div>
                    <div>
                      <span className="recent-reservation-label">
                        예약 일시:{' '}
                      </span>
                      <span className="recent-reservation-value">
                        {formatDateTime(recentReservation.reservationDate)}
                      </span>
                    </div>
                    <div>
                      <span className="recent-reservation-label">주소: </span>
                      <span className="recent-reservation-value">
                        {recentReservation.address}{' '}
                        {recentReservation.addressDetail}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="recent-reservation-label text-gray-600 dark:text-gray-300">
                    최근 예약이 없습니다.
                  </div>
                )}
              </div>
              {recentReservation && (
                <div
                  className={`ml-4 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap border ${
                    recentReservation.status === 'COMPLETED'
                      ? 'bg-gray-100 text-gray-500 border-gray-200'
                      : recentReservation.status === 'CANCELED'
                        ? 'bg-red-100 text-red-500 border-red-200'
                        : 'bg-orange-100 text-orange-500 border-orange-200'
                  }`}
                >
                  {RESERVATION_STATUS_LABELS[
                    recentReservation.status as keyof typeof RESERVATION_STATUS_LABELS
                  ] || recentReservation.status}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConsumerMain;
