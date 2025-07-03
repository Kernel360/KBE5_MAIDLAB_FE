import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReservationListResponse } from '@/types/reservation';
import { useReservation } from '@/hooks/domain/useReservation';
import { useMatching } from '@/hooks/domain/useMatching';
import { formatDateTime } from '@/utils';
import { useReservationStatus } from '@/hooks/domain/useReservationStatus';
import { SERVICE_TYPE_LABELS, SERVICE_TYPES } from '@/constants/service';
import { RESERVATION_STATUS } from '@/constants/status';
import { ManagerReservationCard } from '@/components';
import { useToast } from '@/hooks/useToast';
import {CheckInOutModal,ConfirmModal,MatchingCard,TabHeader} from '@/components'
import { ROUTES } from '@/constants/route';
import { Header } from '@/components';
const FILTERS = [
  { label: '오늘', value: 'TODAY' },
  { label: '예정', value: 'PAID' },
  { label: '진행중', value: 'WORKING' },
  { label: '완료', value: 'COMPLETED' },
];

const PAGE_SIZE = 5;

// 매니저 예약 페이지 전용 상태 레이블
const MANAGER_STATUS_LABELS = {
  [RESERVATION_STATUS.MATCHED]: '결제 대기중',
  [RESERVATION_STATUS.PAID]: '예정',
};

const ManagerReservationsAndMatching: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    fetchReservations,
    checkIn,
    checkOut,
    respondToReservation,
    reservations,
  } = useReservation();
  const { fetchMatchings, matchings } = useMatching();
  const { getStatusBadgeStyle } = useReservationStatus();
  
  // 매니저 페이지 전용 상태 레이블 함수
  const getManagerStatusLabel = (status: string, reservationDate?: string) => {
    if (status === RESERVATION_STATUS.PAID && reservationDate) {
      const today = new Date();
      const resDate = new Date(reservationDate);
      const diffTime = resDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return '업무를 시작하세요!';
      if (diffDays === 1) return '내일 예정';
      if (diffDays > 0) return `D-${diffDays}`;
      if (diffDays < 0) return `D+${Math.abs(diffDays)}`;
    }
    
    return MANAGER_STATUS_LABELS[status as keyof typeof MANAGER_STATUS_LABELS] || status;
  };
  const [tab, setTab] = useState<'schedule' | 'request'>('schedule');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'PAID' | 'TODAY' | 'WORKING' | 'COMPLETED'>('TODAY');
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState<{ type: 'success' | 'fail' | null, info?: any }>({ type: null });
  const [checkInOutModal, setCheckInOutModal] = useState<{
    isOpen: boolean;
    isCheckIn: boolean;
    reservationId: number | null;
    reservationInfo: { serviceType: string; detailServiceType: string; time: string };
  }>({
    isOpen: false,
    isCheckIn: true,
    reservationId: null,
    reservationInfo: { serviceType: '', detailServiceType: '', time: '' },
  });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; isCheckIn: boolean }>({
    isOpen: false,
    isCheckIn: true,
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchReservations(), fetchMatchings()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 날짜만 추출
  const getDateOnly = (dateStr: string) => {
    if (!dateStr) return '';
    return dateStr.split('T')[0].split(' ')[0];
  };

  // 예약 일정 필터링
  const todayStr = new Date().toISOString().slice(0, 10);
  let filteredReservations: ReservationListResponse[] = [];
  if (filter === 'PAID') {
    filteredReservations = reservations.filter(r => {
      const dateOnly = getDateOnly(r.reservationDate);
      return (
        ((r.status === RESERVATION_STATUS.PAID || r.status === RESERVATION_STATUS.MATCHED) && dateOnly > todayStr) ||
        (dateOnly === todayStr && ([RESERVATION_STATUS.PAID, RESERVATION_STATUS.MATCHED] as string[]).includes(r.status))
      );
    });
  } else if (filter === 'TODAY') {
    filteredReservations = reservations
      .filter(r =>
        ([RESERVATION_STATUS.PAID, RESERVATION_STATUS.MATCHED, RESERVATION_STATUS.WORKING, RESERVATION_STATUS.COMPLETED] as string[]).includes(r.status) &&
        (getDateOnly(r.reservationDate) === todayStr)
      )
      .sort((a, b) => {
        const order = {
          [RESERVATION_STATUS.MATCHED]: 0,
          [RESERVATION_STATUS.PAID]: 1,
          [RESERVATION_STATUS.WORKING]: 2,
          [RESERVATION_STATUS.COMPLETED]: 3,
        };
        return (order[a.status as keyof typeof order] ?? 99) - (order[b.status as keyof typeof order] ?? 99);
      });
  } else if (filter === 'WORKING') {
    filteredReservations = reservations.filter(r => r.status === RESERVATION_STATUS.WORKING);
  } else if (filter === 'COMPLETED') {
    filteredReservations = reservations.filter(r => r.status === RESERVATION_STATUS.COMPLETED);
  }
  const totalPages = Math.ceil(filteredReservations.length / PAGE_SIZE);
  const paginatedReservations = filteredReservations.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // 체크인/아웃 핸들러
  const handleCheckInOutClick = (reservation: ReservationListResponse, isCheckIn: boolean) => {
    setCheckInOutModal({
      isOpen: true,
      isCheckIn,
      reservationId: reservation.reservationId,
      reservationInfo: {
        serviceType: SERVICE_TYPE_LABELS[reservation.serviceType as keyof typeof SERVICE_TYPES] ?? reservation.serviceType,
        detailServiceType: reservation.detailServiceType,
        time: `${formatDateTime(reservation.reservationDate)} ${reservation.startTime} ~ ${reservation.endTime}`,
      },
    });
  };

  const handleModalConfirm = async () => {
    if (!checkInOutModal.reservationId) return;
    try {
      const action = checkInOutModal.isCheckIn ? checkIn : checkOut;
      await action(checkInOutModal.reservationId, { checkTime: new Date().toISOString() });
      setCheckInOutModal({ ...checkInOutModal, isOpen: false });
      setConfirmModal({ isOpen: true, isCheckIn: checkInOutModal.isCheckIn });
      fetchReservations(true);
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
      getStatusBadgeStyle={getStatusBadgeStyle}
      getStatusLabel={getManagerStatusLabel}
      onDetailClick={() => navigate(ROUTES.MANAGER.RESERVATION_DETAIL.replace(':id', String(reservation.reservationId)))}
      onCheckIn={() => handleCheckInOutClick(reservation, true)}
      onCheckOut={async () => {
        const result = await checkOut(reservation.reservationId, { checkTime: new Date().toISOString() });
        if (result.success) {
          // 상태 업데이트를 위한 짧은 지연 후 네비게이션
          setTimeout(() => {
            navigate(ROUTES.MANAGER.REVIEW_REGISTER.replace(':id', String(reservation.reservationId)));
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
        const result = await respondToReservation(matching.reservationId, { status: true });
        if (result.success) setModal({ type: 'success', info: matching });
      }}
      onReject={async () => {
        const result = await respondToReservation(matching.reservationId, { status: false });
        if (result.success) setModal({ type: 'fail' });
      }}
    />
  );

  // 필터 드롭다운 UI
  const filterDropdown = (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setFilterOpen((v) => !v)}
        className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-full font-semibold text-gray-700 bg-white hover:bg-gray-100"
      >
        {FILTERS.find((f) => f.value === filter)?.label}
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {filterOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setFilter(f.value as 'PAID' | 'TODAY' | 'WORKING' | 'COMPLETED'); setFilterOpen(false); setCurrentPage(1); }}
              className={`block w-full px-4 py-2 text-left text-gray-700 hover:bg-orange-50 ${filter === f.value ? 'font-bold text-orange-500' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // 모달 UI
  const now = new Date();
  return (
    <div className="min-h-screen bg-gray-50 flex-col">
      <div className="sticky top-0 z-20 bg-white">
      <Header
        variant="sub"
        title="예약 관리"
        backRoute={ROUTES.HOME}
        showMenu={true}
      />
      </div>
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen p-0 pb-20 relative pt-20">
        {/* 탭 헤더 */}
        <TabHeader
          tab={tab}
          setTab={setTab}
          filter={filter}
          setFilter={setFilter}
          filterDropdown={filterDropdown}
          filterOpen={filterOpen}
          setFilterOpen={setFilterOpen}
        />
        {/* 예약 일정 탭 */}
        {tab === 'schedule' && (
          <div className="px-2 pt-4">
            {loading ? (
              <div className="text-center py-8 text-gray-400">로딩중...</div>
            ) : paginatedReservations.length === 0 ? (
              <div className="text-center py-8 text-gray-400">예약 일정이 없습니다.</div>
            ) : (
              paginatedReservations.map(renderReservationCard)
            )}
            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === i + 1
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
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
          <div className="px-2 pt-4">
            {loading ? (
              <div className="text-center py-8 text-gray-400">로딩중...</div>
            ) : matchings.length === 0 ? (
              <div className="text-center py-8 text-gray-400">예약 요청이 없습니다.</div>
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
          onClose={() => setCheckInOutModal({ ...checkInOutModal, isOpen: false })}
          onConfirm={handleModalConfirm}
          isCheckIn={checkInOutModal.isCheckIn}
          reservationInfo={checkInOutModal.reservationInfo}
        />
      </div>
    </div>
  );
};

export default ManagerReservationsAndMatching;