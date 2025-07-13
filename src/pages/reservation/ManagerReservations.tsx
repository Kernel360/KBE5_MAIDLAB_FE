import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { ReservationListResponse } from '@/types/domain/reservation';
import { useReservation } from '@/hooks/domain/reservation';
import { useMatching } from '@/hooks/domain/useMatching';
import { useManagerReservationPagination } from '@/hooks/domain/reservation';
import { formatDateTime } from '@/utils';
import { SERVICE_TYPE_LABELS, SERVICE_TYPES } from '@/constants/service';
import { ManagerReservationCard } from '@/components';
import { useToast } from '@/hooks/useToast';
import { CheckInOutModal, ConfirmModal, MatchingCard } from '@/components';
import { ROUTES } from '@/constants/route';
import { Header } from '@/components';
import {
  Calendar,
  Clock,
  Activity,
  CheckCircle,
  ChevronDown,
  Filter,
  Inbox,
  SortAsc,
  SortDesc,
} from 'lucide-react';
const FILTERS = [
  {
    label: '오늘 일정',
    value: 'TODAY',
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: '오늘 예약된 모든 일정',
  },
  {
    label: '다가오는 예정',
    value: 'PAID',
    icon: Clock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: '결제 완료 및 미결제 된 향후 일정',
  },
  {
    label: '진행중',
    value: 'WORKING',
    icon: Activity,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: '현재 작업중인 일정',
  },
  {
    label: '완료',
    value: 'COMPLETED',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: '완료된 일정',
  },
];

const ManagerReservationsAndMatching: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { checkIn, checkOut, respondToReservation } = useReservation();
  const { fetchMatchings, matchings } = useMatching();

  // 서버사이드 페이징 훅 사용
  const {
    reservations,
    loading,
    currentPage,
    totalPages,
    status: filter,
    sortBy,
    sortOrder,
    changePage,
    changeStatus,
    changeSort,
    refresh,
  } = useManagerReservationPagination({
    initialStatus: 'TODAY',
    pageSize: 5,
  });

  const [tab, setTab] = useState<'schedule' | 'request'>(() => {
    const tabParam = searchParams.get('tab');
    return tabParam === 'request' || tabParam === 'schedule'
      ? tabParam
      : 'schedule';
  });
  const [matchingLoading, setMatchingLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [modal, setModal] = useState<{
    type: 'success' | 'fail' | null;
    info?: any;
  }>({ type: null });
  const [checkInOutModal, setCheckInOutModal] = useState<{
    isOpen: boolean;
    isCheckIn: boolean;
    reservationId: number | null;
    reservationInfo: {
      serviceType: string;
      detailServiceType: string;
      time: string;
    };
  }>({
    isOpen: false,
    isCheckIn: true,
    reservationId: null,
    reservationInfo: { serviceType: '', detailServiceType: '', time: '' },
  });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    isCheckIn: boolean;
  }>({
    isOpen: false,
    isCheckIn: true,
  });
  useEffect(() => {
    setMatchingLoading(true);
    fetchMatchings().finally(() => setMatchingLoading(false));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 정렬 방향 토글 핸들러
  const handleSortOrderToggle = useCallback(() => {
    const newOrder = sortOrder === 'DESC' ? 'ASC' : 'DESC';
    changeSort(sortBy, newOrder);
  }, [changeSort, sortBy, sortOrder]);

  // 체크인/아웃 핸들러
  const handleCheckInOutClick = (
    reservation: ReservationListResponse,
    isCheckIn: boolean,
  ) => {
    setCheckInOutModal({
      isOpen: true,
      isCheckIn,
      reservationId: reservation.reservationId,
      reservationInfo: {
        serviceType:
          SERVICE_TYPE_LABELS[
            reservation.serviceType as keyof typeof SERVICE_TYPES
          ] ?? reservation.serviceType,
        detailServiceType: reservation.detailServiceType,
        time: `${formatDateTime(reservation.reservationDate)} ${reservation.startTime} ~ ${reservation.endTime}`,
      },
    });
  };

  const handleModalConfirm = async () => {
    if (!checkInOutModal.reservationId) return;
    try {
      const action = checkInOutModal.isCheckIn ? checkIn : checkOut;
      await action(checkInOutModal.reservationId, {
        checkTime: new Date().toISOString(),
      });
      setCheckInOutModal({ ...checkInOutModal, isOpen: false });
      setConfirmModal({ isOpen: true, isCheckIn: checkInOutModal.isCheckIn });
      refresh(); // 서버사이드 페이징이므로 새로고침 필요
    } catch (error) {
      showToast('작업 처리 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleConfirmModalClose = () => {
    setConfirmModal({ isOpen: false, isCheckIn: true });
  };

  // 예약 일정 카드 UI
  const renderReservationCard = (reservation: any) => (
    <ManagerReservationCard
      key={reservation.reservationId}
      reservation={reservation}
      onDetailClick={() =>
        navigate(
          ROUTES.MANAGER.RESERVATION_DETAIL.replace(
            ':id',
            String(reservation.reservationId),
          ),
        )
      }
      onCheckIn={() => handleCheckInOutClick(reservation, true)}
      onCheckOut={async () => {
        const result = await checkOut(reservation.reservationId, {
          checkTime: new Date().toISOString(),
        });
        if (result.success) {
          // 서버사이드 페이징이므로 새로고침 필요
          refresh();
          // 상태 업데이트를 위한 짧은 지연 후 네비게이션
          setTimeout(() => {
            navigate(
              ROUTES.MANAGER.REVIEW_REGISTER.replace(
                ':id',
                String(reservation.reservationId),
              ),
            );
          }, 100);
        }
      }}
    />
  );

  // 예약 요청 카드 UI
  const renderMatchingCard = (matching: any) => (
    <MatchingCard
      key={matching.reservationId}
      matching={matching}
      onAccept={async () => {
        const result = await respondToReservation(matching.reservationId, {
          status: true,
        });

        if (result.success) {
          setModal({ type: 'success', info: matching });
          refresh(); // 서버사이드 페이징이므로 새로고침 필요
        }
      }}
      onReject={async () => {
        const result = await respondToReservation(matching.reservationId, {
          status: false,
        });

        if (result.success) {
          setModal({ type: 'fail' });
          refresh(); // 서버사이드 페이징이므로 새로고침 필요
        }
      }}
    />
  );

  // 필터 드롭다운 UI
  const currentFilter = FILTERS.find((f) => f.value === filter);
  const CurrentIcon = currentFilter?.icon || Filter;

  const filterDropdown = (
    <div className="relative">
      <button
        onClick={() => setFilterOpen((v) => !v)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200
          ${currentFilter ? `${currentFilter.bgColor} ${currentFilter.borderColor} ${currentFilter.color} border` : 'bg-gray-100 border border-gray-200 text-gray-700'}
          hover:shadow-sm
        `}
      >
        <CurrentIcon className="w-5 h-5" />
        <span className="text-sm font-medium">{currentFilter?.label}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {filterOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-2">
            <div className="text-xs text-gray-500 font-medium px-3 py-2 border-b border-gray-100 mb-1">
              일정 필터
            </div>
            {FILTERS.map((f, index) => {
              const FilterIcon = f.icon;
              return (
                <button
                  key={f.value}
                  onClick={() => {
                    changeStatus(
                      f.value as 'PAID' | 'TODAY' | 'WORKING' | 'COMPLETED',
                    );
                    setFilterOpen(false);
                  }}
                  className={`
                    w-full flex items-start gap-3 px-3 py-3 rounded-md transition-all duration-200 text-left
                    ${
                      filter === f.value
                        ? `${f.bgColor} ${f.color} font-semibold`
                        : 'text-gray-700 hover:bg-gray-50'
                    }
                    ${index > 0 ? 'mt-1' : ''}
                  `}
                >
                  <FilterIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{f.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {f.description}
                    </div>
                  </div>
                  {filter === f.value && (
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex-col">
      <div className="sticky top-0 z-20 bg-white">
        <Header
          variant="sub"
          title="예약 내역"
          backRoute={ROUTES.HOME}
          showMenu={true}
        />
      </div>
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen p-0 pb-20 relative">
        {/* 탭 헤더 */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-[65px] z-10">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">일정 관리</h2>
              {tab === 'schedule' && (
                <div className="flex items-center gap-2">
                  {/* 정렬 방향 토글 버튼 */}
                  <button
                    onClick={handleSortOrderToggle}
                    className="flex items-center gap-1 px-3 py-2 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors"
                    title={sortOrder === 'DESC' ? '내림차순' : '오름차순'}
                  >
                    {sortOrder === 'DESC' ? (
                      <SortDesc className="w-4 h-4 text-orange-600" />
                    ) : (
                      <SortAsc className="w-4 h-4 text-orange-600" />
                    )}
                  </button>
                  {filterDropdown}
                </div>
              )}
            </div>

            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setTab('schedule')}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-md transition-all duration-200 font-medium text-sm
                  ${
                    tab === 'schedule'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }
                `}
              >
                <Calendar className="w-4 h-4" />
                <span>일정 내역</span>
                {reservations.length > 0 && (
                  <span
                    className={`
                    px-2 py-0.5 rounded-full text-xs font-semibold
                    ${tab === 'schedule' ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-500'}
                  `}
                  >
                    {reservations.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setTab('request')}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-md transition-all duration-200 font-medium text-sm
                  ${
                    tab === 'request'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }
                `}
              >
                <Inbox className="w-4 h-4" />
                <span>고객 예약 요청</span>
                {matchings.length > 0 && (
                  <span
                    className={`
                    px-2 py-0.5 rounded-full text-xs font-semibold
                    ${tab === 'request' ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-500'}
                  `}
                  >
                    {matchings.length >= 10 ? '10+' : matchings.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
        {/* 예약 일정 탭 */}
        {tab === 'schedule' && (
          <div className="px-4 pt-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500 mb-4"></div>
                <p className="text-gray-500 font-medium">로딩중...</p>
              </div>
            ) : reservations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-full p-6 mb-6">
                  {currentFilter?.icon && (
                    <currentFilter.icon
                      className={`w-12 h-12 ${currentFilter.color}`}
                    />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {filter === 'TODAY' && '오늘 예약 일정이 없습니다'}
                  {filter === 'PAID' && '다가오는 예정 일정이 없습니다'}
                  {filter === 'WORKING' && '진행중인 작업이 없습니다'}
                  {filter === 'COMPLETED' && '완료된 작업이 없습니다'}
                </h3>
                <p className="text-gray-500 text-center leading-relaxed mb-8">
                  {filter === 'TODAY' &&
                    '오늘은 예약된 일정이 없어요.\n내일 이후 예약을 "다가오는 예정"에서 확인하세요.'}
                  {filter === 'PAID' &&
                    '결제 완료된 향후 예약이 없어요.\n새로운 예약 요청을 확인해보세요.'}
                  {filter === 'WORKING' &&
                    '현재 진행중인 작업이 없어요.\n오늘 일정이나 예정된 일정을 확인해보세요.'}
                  {filter === 'COMPLETED' &&
                    '완료된 작업이 없어요.\n작업을 완료하면 여기에 표시됩니다.'}
                </p>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    {filter !== 'TODAY' && (
                      <button
                        onClick={() => {
                          changeStatus('TODAY');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium text-sm"
                      >
                        <Calendar className="w-4 h-4" />
                        오늘 일정 확인
                      </button>
                    )}
                    {filter === 'TODAY' && (
                      <button
                        onClick={() => {
                          changeStatus('PAID');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium text-sm"
                      >
                        <Clock className="w-4 h-4" />
                        다가오는 예정 확인
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setTab('request')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm"
                  >
                    <Inbox className="w-4 h-4" />
                    예약 요청 확인
                  </button>
                </div>
              </div>
            ) : (
              reservations.map(renderReservationCard)
            )}
            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => changePage(i)}
                    className={`
                      w-10 h-10 rounded-xl font-semibold text-sm transition-all duration-200
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
          </div>
        )}
        {/* 예약 요청 탭 */}
        {tab === 'request' && (
          <div className="px-4 pt-6">
            {matchingLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500 mb-4"></div>
                <p className="text-gray-500 font-medium">로딩중...</p>
              </div>
            ) : matchings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-full p-6 mb-6">
                  <Inbox className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  새로운 예약 요청이 없습니다
                </h3>
                <p className="text-gray-500 text-center leading-relaxed mb-8">
                  고객으로부터 새로운 예약 요청이 들어오면{'\n'}
                  여기에서 확인하고 승인하실 수 있어요.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setTab('schedule')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium text-sm"
                  >
                    <Calendar className="w-4 h-4" />
                    예약 일정 보기
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm"
                  >
                    <Activity className="w-4 h-4" />
                    새로고침
                  </button>
                </div>
              </div>
            ) : (
              matchings.map(renderMatchingCard)
            )}
          </div>
        )}
        {/* 승인/거절 모달 */}
        {modal.type === 'success' && (
          <ConfirmModal
            isOpen={true}
            onClose={() => window.location.reload()}
            isCheck={true}
          />
        )}
        {modal.type === 'fail' && (
          <ConfirmModal
            isOpen={true}
            onClose={() => window.location.reload()}
            isCheck={false}
          />
        )}
        <CheckInOutModal
          isOpen={checkInOutModal.isOpen}
          onClose={() =>
            setCheckInOutModal({ ...checkInOutModal, isOpen: false })
          }
          onConfirm={handleModalConfirm}
          isCheckIn={checkInOutModal.isCheckIn}
          reservationInfo={checkInOutModal.reservationInfo}
        />
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={handleConfirmModalClose}
          isCheck={confirmModal.isCheckIn}
        />
      </div>
    </div>
  );
};

export default ManagerReservationsAndMatching;
