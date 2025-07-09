import React, { useEffect, useState, useCallback } from 'react';
import { useReservationPagination } from '@/hooks/domain/useReservationPagination';
import { useReservation } from '@/hooks/domain/useReservation';
import { ReservationCard } from '@/components';
import { ROUTES, RESERVATION_STATUS } from '@/constants';
import { useNavigate } from 'react-router-dom';
import type { PagingParams } from '@/types/domain/reservation';
import type { ReservationStatus } from '@/constants/status';
import { Header } from '@/components';
import { useReservationStatus } from '@/hooks/useReservationStatus';
import {
  Clock,
  Calendar,
  Check,
  CalendarDays,
  ChevronDown,
  SortAsc,
  SortDesc,
  CreditCard,
  Banknote,
} from 'lucide-react';

type TabType = '전체' | '결제하기' | '예정' | '대기중' | '완료';

const TABS = [
  {
    key: '전체' as TabType,
    label: '전체',
    icon: CalendarDays,
    color: 'text-gray-600',
  },
  {
    key: '결제하기' as TabType,
    label: '결제하기',
    icon: CreditCard,
    color: 'text-red-600',
  },
  {
    key: '예정' as TabType,
    label: '예정',
    icon: Calendar,
    color: 'text-blue-600',
  },
  {
    key: '대기중' as TabType,
    label: '대기중',
    icon: Clock,
    color: 'text-amber-600',
  },
  {
    key: '완료' as TabType,
    label: '완료',
    icon: Check,
    color: 'text-green-600',
  },
];

// 탭에서 서버 상태로 매핑
const TAB_TO_STATUS_MAP: Record<TabType, ReservationStatus | undefined> = {
  전체: undefined,
  결제하기: RESERVATION_STATUS.MATCHED,
  예정: RESERVATION_STATUS.PAID,
  대기중: RESERVATION_STATUS.PENDING,
  완료: RESERVATION_STATUS.COMPLETED,
} as const;

// 정렬 옵션
const SORT_OPTIONS = [
  { key: 'createdAt', label: '생성순', icon: Calendar },
  { key: 'reservationDate', label: '예약일순', icon: Clock },
  { key: 'totalPrice', label: '금액순', icon: Banknote },
] as const;

const ConsumerReservations: React.FC = () => {
  const navigate = useNavigate();
  const {
    data: paginatedData,
    params,
    loading,
    error,
    changeStatus,
    changePage,
    changeSort,
    fetchReservations,
  } = useReservationPagination();

  const { payReservation } = useReservation();

  const [activeTab, setActiveTab] = useState<TabType>('전체');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const { getStatusBadgeStyle } = useReservationStatus();

  // 현재 데이터
  const currentReservations = paginatedData?.content || [];
  const totalPages = paginatedData?.totalPages || 0;
  const currentPage = paginatedData?.number || 0;
  const totalElements = paginatedData?.totalElements || 0;

  // 초기 데이터 로드
  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // 탭 변경 핸들러
  const handleTabChange = useCallback(
    async (tab: TabType) => {
      setActiveTab(tab);
      const status = TAB_TO_STATUS_MAP[tab];
      await changeStatus(status);
    },
    [changeStatus],
  );

  // 페이지 변경 핸들러
  const handlePageChange = useCallback(
    async (page: number) => {
      await changePage(page);
    },
    [changePage],
  );

  // 정렬 기준 변경 핸들러
  const handleSortByChange = useCallback(
    async (sortBy: PagingParams['sortBy']) => {
      await changeSort(sortBy, params.sortOrder);
      setShowSortOptions(false);
    },
    [params.sortOrder, changeSort],
  );

  // 정렬 방향 토글 핸들러
  const handleSortOrderToggle = useCallback(async () => {
    const newOrder = params.sortOrder === 'DESC' ? 'ASC' : 'DESC';
    await changeSort(params.sortBy, newOrder);
  }, [params.sortBy, params.sortOrder, changeSort]);

  // 결제 핸들러
  const handlePayment = useCallback(
    async (reservationId: number) => {
      const result = await payReservation(reservationId);

      if (result.success) {
        // 결제 성공 시 현재 페이지 새로고침
        await fetchReservations();
      }
    },
    [payReservation, fetchReservations],
  );

  // 로딩 스켈레톤 컴포넌트
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse mb-4">
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
  );

  // 현재 정렬 옵션 찾기
  const currentSortOption =
    SORT_OPTIONS.find((option) => option.key === params.sortBy) ||
    SORT_OPTIONS[0];
  const SortIcon = currentSortOption.icon;

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

  const handlePaymentClick = (
    reservationId: number,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    navigate(
      ROUTES.CONSUMER.RESERVATION_DETAIL.replace(':id', String(reservationId)),
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        variant="sub"
        title="예약 내역"
        backRoute={ROUTES.HOME}
        showMenu={true}
      />
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen p-0 pb-20 relative">
        {/* 탭 네비게이션 */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-[65px] z-10">
          <div className="px-4 py-3">
            {/* 정렬 옵션 */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900">예약 내역</h3>
              <div className="flex items-center gap-2">
                {/* 정렬 방향 토글 버튼 */}
                <button
                  onClick={handleSortOrderToggle}
                  className="flex items-center gap-1 px-3 py-2 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors"
                  title={params.sortOrder === 'DESC' ? '내림차순' : '오름차순'}
                >
                  {params.sortOrder === 'DESC' ? (
                    <SortDesc className="w-4 h-4 text-orange-600" />
                  ) : (
                    <SortAsc className="w-4 h-4 text-orange-600" />
                  )}
                </button>
                {/* 정렬 기준 선택 버튼 */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortOptions(!showSortOptions)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <SortIcon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {currentSortOption.label}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </button>

                  {showSortOptions && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      {SORT_OPTIONS.map((option) => {
                        const OptionIcon = option.icon;
                        const isActive = params.sortBy === option.key;
                        return (
                          <button
                            key={option.key}
                            onClick={() =>
                              handleSortByChange(
                                option.key as PagingParams['sortBy'],
                              )
                            }
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                              isActive
                                ? 'bg-orange-50 text-orange-600'
                                : 'text-gray-700'
                            }`}
                          >
                            <OptionIcon className="w-4 h-4" />
                            <span className="text-sm">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {TABS.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    className={`
                      flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-md transition-all duration-200
                      ${
                        isActive
                          ? 'bg-white shadow-sm text-orange-500 font-semibold'
                          : 'text-gray-600 hover:text-gray-800'
                      }
                    `}
                  >
                    <IconComponent
                      className={`w-5 h-5 mb-1 ${isActive ? 'text-orange-500' : tab.color}`}
                    />
                    <span className="text-xs">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="px-4 pt-6">
          {/* 데이터 정보 */}
          {!loading && paginatedData && (
            <div className="mb-4 text-sm text-gray-500 text-center">
              전체 {totalElements}건 중{' '}
              {Math.min((currentPage + 1) * 5, totalElements)}건 표시
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="bg-red-100 rounded-full p-6 mb-6">
                <CalendarDays className="w-12 h-12 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                데이터를 불러올 수 없어요
              </h3>
              <p className="text-gray-500 text-center leading-relaxed mb-8">
                {error}
              </p>
              <button
                onClick={() => fetchReservations()}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
              >
                다시 시도
              </button>
            </div>
          ) : currentReservations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-full p-6 mb-6">
                <CalendarDays className="w-12 h-12 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                예약 내역이 없습니다
              </h3>
              <p className="text-gray-500 text-center leading-relaxed mb-8">
                {activeTab === '전체'
                  ? '아직 예약한 서비스가 없어요.\n첫 번째 예약을 만들어보세요!'
                  : `${activeTab} 예약이 없어요.`}
              </p>
              <button
                onClick={() => navigate(ROUTES.HOME)}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
              >
                <Calendar className="w-5 h-5" />
                예약하러 가기
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {currentReservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.reservationId}
                    reservation={reservation}
                    onDetailClick={() =>
                      handleReservationClick(reservation.reservationId)
                    }
                    onPaymentClick={handlePaymentClick}
                    onReviewClick={handleReviewClick}
                    getStatusBadgeStyle={getStatusBadgeStyle}
                  />
                ))}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 gap-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      disabled={loading}
                      className={`
                        w-10 h-10 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50
                        ${
                          currentPage === i
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsumerReservations;
