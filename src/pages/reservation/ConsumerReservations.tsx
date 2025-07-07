import React, { useEffect, useState } from 'react';
import { useReservation } from '@/hooks/domain/useReservation';
import { usePagination } from '@/hooks/usePagination';
import { ReservationCard } from '@/components';
import { ROUTES, RESERVATION_STATUS } from '@/constants';
import { useNavigate } from 'react-router-dom';
import type { ReservationListResponse } from '@/types/reservation';
import { Header } from '@/components';
import { useReservationStatus } from '@/hooks/useReservationStatus';
import { Clock, Calendar, Coffee, Check, CalendarDays } from 'lucide-react';

type TabType = '전체' | '요청 대기중' | '예정' | '진행중' | '완료';

const TABS = [
  {
    key: '전체' as TabType,
    label: '전체',
    icon: CalendarDays,
    color: 'text-gray-600',
  },
  {
    key: '요청 대기중' as TabType,
    label: '대기중',
    icon: Clock,
    color: 'text-amber-600',
  },
  {
    key: '예정' as TabType,
    label: '예정',
    icon: Calendar,
    color: 'text-blue-600',
  },
  {
    key: '진행중' as TabType,
    label: '진행중',
    icon: Coffee,
    color: 'text-purple-600',
  },
  {
    key: '완료' as TabType,
    label: '완료',
    icon: Check,
    color: 'text-green-600',
  },
];

const RESERVATION_FILTERS = {
  전체: (reservations: ReservationListResponse[]) => reservations,
  '요청 대기중': (reservations: ReservationListResponse[]) =>
    reservations.filter((r) => r.status === RESERVATION_STATUS.PENDING),
  예정: (reservations: ReservationListResponse[]) =>
    reservations.filter(
      (r) =>
        r.status === RESERVATION_STATUS.MATCHED ||
        r.status === RESERVATION_STATUS.PAID,
    ),
  진행중: (reservations: ReservationListResponse[]) =>
    reservations.filter((r) => r.status === RESERVATION_STATUS.WORKING),
  완료: (reservations: ReservationListResponse[]) =>
    reservations.filter((r) => r.status === RESERVATION_STATUS.COMPLETED),
} as const;

const ConsumerReservations: React.FC = () => {
  const navigate = useNavigate();
  const { reservations, loading, fetchReservations, payReservation } =
    useReservation();
  const [activeTab, setActiveTab] = useState<TabType>('전체');
  const [filteredReservations, setFilteredReservations] = useState<
    ReservationListResponse[]
  >([]);
  const { getStatusBadgeStyle } = useReservationStatus();

  const pagination = usePagination({
    totalItems: filteredReservations.length,
    itemsPerPage: 5,
    initialPage: 0,
  });

  // 각 탭별 개수 계산
  const getTabCount = (tabKey: TabType): number => {
    if (!reservations) return 0;
    const filterFn = RESERVATION_FILTERS[tabKey];
    return filterFn(reservations).length;
  };

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  useEffect(() => {
    if (reservations) {
      const filterFn = RESERVATION_FILTERS[activeTab];
      setFilteredReservations(filterFn(reservations));
    }
  }, [reservations, activeTab]);


  const handleReservationClick = (reservationId: number) => {
    navigate(
      ROUTES.CONSUMER.RESERVATION_DETAIL.replace(':id', String(reservationId)),
    );
  };

  const handleReviewClick = (
    reservationId: number,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    navigate(
      ROUTES.CONSUMER.REVIEW_REGISTER.replace(':id', String(reservationId)),
    );
  };

  const handlePaymentClick = async (
    reservationId: number,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    await payReservation(reservationId);
  };

  const currentReservations = filteredReservations.slice(pagination.startIndex, pagination.endIndex);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <Header
        variant="sub"
        title="예약 내역"
        backRoute={ROUTES.HOME}
        showMenu={true}
      />

      <div className="max-w-md mx-auto bg-gray-50 min-h-screen pt-20">
        {/* 탭 네비게이션 */}
        <div className="bg-gray-50 border-b border-gray-100 sticky top-[64px] z-10">
          <div className="flex">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              const count = getTabCount(tab.key);

              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    pagination.goToFirst();
                  }}
                  className={`
                    flex-1 flex flex-col items-center justify-center py-4 px-2 relative
                    ${
                      isActive
                        ? 'text-orange-600 bg-orange-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }
                    transition-all duration-200
                  `}
                >
                  <div className="flex items-center justify-center mb-1">
                    <Icon
                      className={`w-5 h-5 ${isActive ? 'text-orange-600' : 'text-gray-400'}`}
                    />
                    {count > 0 && (
                      <span
                        className={`
                        ml-1 px-1.5 py-0.5 text-xs font-medium rounded-full min-w-[18px] text-center
                        ${
                          isActive
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-400 text-white'
                        }
                      `}
                      >
                        {count}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium">{tab.label}</span>

                  {/* 활성 탭 인디케이터 */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="p-4 pb-24">
          {loading ? (
            <div className="space-y-4">
              {/* 로딩 스켈레톤 */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : currentReservations.length > 0 ? (
            <>
              <div className="space-y-3">
                {currentReservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.reservationId}
                    reservation={reservation}
                    getStatusBadgeStyle={(status, reservationDate) =>
                      getStatusBadgeStyle(status, reservationDate)
                    }
                    onReviewClick={handleReviewClick}
                    onDetailClick={handleReservationClick}
                    onPaymentClick={handlePaymentClick}
                  />
                ))}
              </div>

              {/* 페이지네이션 */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 gap-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => pagination.goToPage(i)}
                      className={`
                        w-10 h-10 rounded-xl font-semibold text-sm transition-all duration-200
                        ${pagination.currentPage === i
                          ? 'bg-orange-500 text-white shadow-md scale-110'
                          : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-500 hover:scale-105'
                        }
                      `}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* 빈 상태 */
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === '전체'
                  ? '예약 내역이 없습니다'
                  : `${activeTab} 예약이 없습니다`}
              </h3>
              <p className="text-gray-500 text-sm">
                {activeTab === '전체'
                  ? '첫 예약을 진행해보세요'
                  : '다른 탭에서 예약을 확인해보세요'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsumerReservations;
