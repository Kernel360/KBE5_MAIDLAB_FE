import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReservation } from '@/hooks';
import { formatDate } from '@/utils/date';
import type { SettlementResponse } from '@/types/domain/reservation';
import WeekSelector from '@/components/features/manager/WeekSelector';
import SettlementSummary from '@/components/features/manager/SettlementSummary';
import StatusFilter from '@/components/features/manager/StatusFilter';
import SettlementCard from '@/components/features/manager/SettlementCard';
import EmptyState from '@/components/features/manager/EmptyState';
import LoadingSkeleton from '@/components/features/manager/LoadingSkeleton';
import { ROUTES } from '@/constants';
import { Header } from '@/components';

const SETTLEMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: '정산 대기중',
  APPROVED: '승인완료',
  REJECTED: '거절됨',
};

const getMonday = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const addWeeks = (date: Date, weeks: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
};

const ManagerSettlements: React.FC = () => {
  const { fetchWeeklySettlements } = useReservation();
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState<Date>(getMonday(new Date()));
  const [settlements, setSettlements] = useState<SettlementResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<string>('ALL');

  const fetchData = async (week: Date) => {
    setLoading(true);
    const startDate = formatDate(getMonday(week));
    const data = await fetchWeeklySettlements(startDate);
    if (data) {
      setSettlements(data.settlements);
    } else {
      setSettlements([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(currentWeek);
  }, [currentWeek]);

  const handlePrevWeek = () => setCurrentWeek((prev) => addWeeks(prev, -1));
  const handleNextWeek = () => setCurrentWeek((prev) => addWeeks(prev, 1));

  const handleReservationClick = (reservationId: number) => {
    navigate(`/manager/reservations/${reservationId}`);
  };

  // 상태별 통계 계산 (REJECTED 건은 정산 금액에서 제외)
  const totalPlatformFee = settlements.reduce(
    (sum, s) => sum + s.platformFee,
    0,
  );
  const approvedSettlements = settlements.filter(
    (s) => s.status === 'APPROVED',
  );
  const pendingSettlements = settlements.filter((s) => s.status === 'PENDING');
  const rejectedSettlements = settlements.filter(
    (s) => s.status === 'REJECTED',
  );

  // 실제 정산 금액 계산 (REJECTED 건 제외)
  const actualSettlementAmount =
    approvedSettlements.reduce((sum, s) => sum + s.amount, 0) +
    pendingSettlements.reduce((sum, s) => sum + s.amount, 0);

  const statusStats = {
    APPROVED: {
      count: approvedSettlements.length,
      amount: approvedSettlements.reduce((sum, s) => sum + s.amount, 0),
    },
    PENDING: {
      count: pendingSettlements.length,
      amount: pendingSettlements.reduce((sum, s) => sum + s.amount, 0),
    },
    REJECTED: {
      count: rejectedSettlements.length,
      amount: rejectedSettlements.reduce((sum, s) => sum + s.amount, 0),
    },
  };

  // 필터링된 정산 내역
  const filteredSettlements =
    selectedStatusFilter === 'ALL'
      ? settlements
      : settlements.filter((s) => s.status === selectedStatusFilter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        variant="sub"
        title="정산 내역"
        backRoute={ROUTES.HOME}
        showMenu={true}
      />

      <div className="px-4 py-6 pb-20">
        <div className="max-w-md mx-auto space-y-6">
          <WeekSelector
            currentWeek={currentWeek}
            onPrevWeek={handlePrevWeek}
            onNextWeek={handleNextWeek}
            loading={loading}
          />

          <SettlementSummary
            actualSettlementAmount={actualSettlementAmount}
            totalPlatformFee={totalPlatformFee}
            statusStats={statusStats}
            loading={loading}
          />

          <StatusFilter
            selectedFilter={selectedStatusFilter}
            onFilterChange={setSelectedStatusFilter}
            totalCount={settlements.length}
            statusStats={statusStats}
          />

          {/* 정산 내역 리스트 */}
          <div className="space-y-3">
            {loading ? (
              <LoadingSkeleton count={3} />
            ) : filteredSettlements.length === 0 ? (
              <EmptyState
                selectedFilter={selectedStatusFilter}
                settlementStatusLabels={SETTLEMENT_STATUS_LABELS}
              />
            ) : (
              filteredSettlements.map((settlement) => (
                <SettlementCard
                  key={settlement.settlementId}
                  settlement={settlement}
                  onViewDetails={handleReservationClick}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerSettlements;
