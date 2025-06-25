import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReservationListResponse } from '@/types/reservation';
import { useReservation } from '@/hooks/domain/useReservation';
import { useMatching } from '@/hooks/domain/useMatching';
import { formatDateTime, formatPrice } from '@/utils';
import { SUCCESS_MESSAGES } from '@/constants/message';
import { useReservationStatus } from '@/hooks/domain/useReservationStatus';
import { SERVICE_TYPE_LABELS, SERVICE_TYPES } from '@/constants/service';
import { RESERVATION_STATUS} from '@/constants/status';
import { ManagerReservationCard } from '@/components/features/reservation/ManagerReservationCard';
import ReservationHeader from '@/components/features/consumer/ReservationHeader';

const ITEMS_PER_PAGE = 10;
import {ManagerFooter} from '@/components/layout/BottomNavigation/BottomNavigation';
import { useToast } from '@/hooks/useToast';

interface CheckInOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isCheckIn: boolean;
  reservationInfo: {
    serviceType: string;
    detailServiceType: string;
    time: string;
  };
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCheckIn: boolean;
}

const CheckInOutModal: React.FC<CheckInOutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isCheckIn,
  reservationInfo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-4">
            서비스를 {isCheckIn ? '시작' : '종료'}하시겠습니까?
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="font-medium">
              {reservationInfo.serviceType} →{' '}
              {reservationInfo.detailServiceType}
            </p>
            <p className="text-gray-600 text-sm mt-1">{reservationInfo.time}</p>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600"
            >
              {isCheckIn ? '체크인' : '체크아웃'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  isCheckIn,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-4">
            {isCheckIn
              ? SUCCESS_MESSAGES.CHECKIN_SUCCESS
              : SUCCESS_MESSAGES.CHECKOUT_SUCCESS}
          </h3>
          <button
            onClick={onClose}
            className="px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

const FILTERS = [
  { label: '예정', value: 'MATCHED' },
  { label: '오늘', value: 'TODAY' },
  { label: '진행중', value: 'WORKING' },
  { label: '완료', value: 'COMPLETED' },
];

const PAGE_SIZE = 10;

const ManagerReservationsAndMatching: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    fetchReservations,
    checkIn,
    checkOut,
    respondToReservation,
    cancelReservation,
    reservations,
  } = useReservation();
  const { fetchMatchings, matchings } = useMatching();
  const {
    getStatusBadgeStyle,
  } = useReservationStatus();
  const [tab, setTab] = useState<'schedule' | 'request'>('schedule');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'MATCHED' | 'TODAY' | 'WORKING' | 'COMPLETED'>('MATCHED');
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

  // 날짜만 추출하는 함수 (T, 공백 등 모두 대응)
  const getDateOnly = (dateStr: string) => {
    if (!dateStr) return '';
    return dateStr.split('T')[0].split(' ')[0];
  };

  // 예약 일정 필터링 (상수 및 훅 사용)
  const todayStr = new Date().toISOString().slice(0, 10);
  let filteredReservations: ReservationListResponse[] = [];
  if (filter === 'MATCHED') {
    filteredReservations = reservations.filter(r => {
      const dateOnly = getDateOnly(r.reservationDate);
      return (
        (r.status === RESERVATION_STATUS.MATCHED && dateOnly > todayStr) ||
        (dateOnly === todayStr && ([RESERVATION_STATUS.MATCHED] as string[]).includes(r.status))
      );
    });
  } else if (filter === 'TODAY') {
    filteredReservations = reservations
      .filter(r =>
        ([RESERVATION_STATUS.MATCHED, RESERVATION_STATUS.WORKING, RESERVATION_STATUS.COMPLETED] as string[]).includes(r.status) &&
        (getDateOnly(r.reservationDate) === todayStr)
      )
      .sort((a, b) => {
        // WORKING → MATCHED → COMPLETED 순서로 정렬
        const order = {
          [RESERVATION_STATUS.MATCHED]: 0,
          [RESERVATION_STATUS.WORKING]: 1,
          [RESERVATION_STATUS.COMPLETED]: 2,
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
      fetchReservations(true); // 데이터 새로고침
    } catch (error) {
      showToast('작업 처리 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleConfirmModalClose = () => {
    setConfirmModal({ isOpen: false, isCheckIn: true });
  };


  // 예약 일정 카드 UI (ManagerReservationCard 활용)
  const renderReservationCard = (reservation: any) => (
    <ManagerReservationCard
      key={reservation.reservationId}
      reservation={reservation}
      getStatusBadgeStyle={getStatusBadgeStyle}
      onDetailClick={() => navigate(`/manager/reservations/${reservation.reservationId}`)}
      onCheckIn={() => handleCheckInOutClick(reservation, true)}
      onCheckOut={() => handleCheckInOutClick(reservation, false)}
    />
  );

  // 예약 요청 카드 UI (이미지와 동일하게)
  const renderMatchingCard = (matching: any) => {
    const info = {
      service: `${matching.detailServiceType} > ${matching.serviceType}`,
      customer: matching.customerName || '고객',
      time: `${matching.startTime} ~ ${matching.endTime}`,
    };
    return (
      <div key={matching.reservationId} className="rounded-2xl border border-gray-200 bg-white px-6 py-5 mb-5 shadow-sm">
        <div className="font-extrabold text-lg text-[#4B2E13] mb-2">{matching.detailServiceType} &gt; {matching.serviceType}</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
          <div className="text-sm text-gray-400">날짜/시간</div>
          <div className="text-base text-[#4B2E13] font-semibold">{formatDateTime(matching.reservationDate)} {matching.startTime} ~ {matching.endTime}</div>
          <div className="text-sm text-gray-400">위치</div>
          <div className="text-base text-[#4B2E13] font-semibold">{matching.address} {matching.addressDetail}</div>
          <div className="text-sm text-gray-400">방크기</div>
          <div className="text-base text-[#4B2E13] font-semibold">{matching.roomSize}평</div>
          <div className="text-sm text-gray-400">반려동물</div>
          <div className="text-base text-[#4B2E13] font-semibold">{matching.pet}</div>
          <div className="text-sm text-gray-400">금액</div>
          <div className="text-base font-bold text-orange-500">{formatPrice(matching.totalPrice)}</div>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={async () => {
              const result = await respondToReservation(matching.reservationId, { status: true });
              if (result.success) setModal({ type: 'success', info });
            }}
            className="flex-1 py-2 border-2 border-orange-400 text-orange-500 rounded-full font-bold hover:bg-orange-50 transition"
          >
            수락
          </button>
          <button
            onClick={async () => {
              const result = await respondToReservation(matching.reservationId, { status: false });
              if (result.success) setModal({ type: 'fail' });
            }}
            className="flex-1 py-2 border-2 border-red-400 text-red-500 rounded-full font-bold hover:bg-red-50 transition"
          >
            거절
          </button>
        </div>
      </div>
    );
  };

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
              onClick={() => { setFilter(f.value as 'MATCHED' | 'TODAY' | 'WORKING' | 'COMPLETED'); setFilterOpen(false); setCurrentPage(1); }}
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
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen p-0 pb-20 relative">
      {/* ReservationHeader를 absolute로 올리고, 탭 헤더에 pt-16 추가 */}
      <div className="absolute top-0 left-0 w-full z-20">
        <ReservationHeader title="예약 관리" onBack={() => navigate(-1)} />
      </div>
      {/* 탭 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 pt-16 pb-2 sticky top-0 z-10">
        <div className="flex gap-8">
          <button
            className={`text-lg font-bold pb-2 border-b-2 ${tab === 'schedule' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'}`}
            onClick={() => setTab('schedule')}
          >
            예약 일정
          </button>
          <button
            className={`text-lg font-bold pb-2 border-b-2 ${tab === 'request' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'}`}
            onClick={() => setTab('request')}
          >
            예약 요청
          </button>
        </div>
        {tab === 'schedule' && filterDropdown}
      </div>
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
          {/* ConsumerReservations.tsx와 동일한 페이지네이션 UI */}
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl w-[340px] flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <div className="text-xl font-bold text-[#4B2E13] mb-2">예약 승인되었습니다</div>
            <div className="text-gray-500 mb-4">서비스를 시작하시겠습니까?</div>
            <div className="bg-gray-50 rounded-lg p-4 w-full text-left mb-4">
              <div className="flex justify-between mb-1"><span className="text-gray-400">서비스</span><span>{modal.info?.service}</span></div>
              <div className="flex justify-between mb-1"><span className="text-gray-400">고객</span><span>{modal.info?.customer}</span></div>
              <div className="flex justify-between mb-1"><span className="text-gray-400">시간</span><span>{modal.info?.time}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">현재 시간</span><span>{now.getHours()}:{now.getMinutes().toString().padStart(2, '0')}</span></div>
            </div>
            <button onClick={() => window.location.reload()} className="w-full py-2 bg-orange-500 text-white rounded-lg font-bold">확인</button>
          </div>
        </div>
      )}
      {modal.type === 'fail' && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl w-[340px] flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <div className="text-xl font-bold text-[#4B2E13] mb-2">예약 승인 거절되었습니다</div>
            <button onClick={() => window.location.reload()} className="w-full py-2 bg-orange-500 text-white rounded-lg font-bold mt-4">확인</button>
          </div>
        </div>
      )}
      <CheckInOutModal
        isOpen={checkInOutModal.isOpen}
        onClose={() => setCheckInOutModal({ ...checkInOutModal, isOpen: false })}
        onConfirm={handleModalConfirm}
        isCheckIn={checkInOutModal.isCheckIn}
        reservationInfo={checkInOutModal.reservationInfo}
      />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={handleConfirmModalClose}
        isCheckIn={confirmModal.isCheckIn}
      />
      <ManagerFooter />
    </div>
    </div>
  );
};

export default ManagerReservationsAndMatching;