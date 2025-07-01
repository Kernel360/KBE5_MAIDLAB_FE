import React from 'react';
import { TrendingUp, Sparkles, CheckCircle, Clock, XCircle } from 'lucide-react';

interface StatusStats {
  APPROVED: { count: number; amount: number };
  PENDING: { count: number; amount: number };
  REJECTED: { count: number; amount: number };
}

interface SettlementSummaryProps {
  actualSettlementAmount: number;
  totalPlatformFee: number;
  statusStats: StatusStats;
  loading?: boolean;
}

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return { 
        icon: CheckCircle, 
        label: '승인완료',
        gradient: 'from-emerald-500 to-green-500',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200'
      };
    case 'PENDING':
      return { 
        icon: Clock, 
        label: '대기중',
        gradient: 'from-amber-500 to-yellow-500',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200'
      };
    case 'REJECTED':
      return { 
        icon: XCircle, 
        label: '거절됨',
        gradient: 'from-red-500 to-rose-500',
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200'
      };
    default:
      return { 
        icon: Clock, 
        label: '알 수 없음',
        gradient: 'from-gray-500 to-slate-500',
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200'
      };
  }
};

const SettlementSummary: React.FC<SettlementSummaryProps> = ({
  actualSettlementAmount,
  totalPlatformFee,
  statusStats,
  loading = false
}) => {
  return (
    <>
      {/* 메인 정산 카드 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-6 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm opacity-90">이번 주 총 정산액</div>
                <div className="text-xs opacity-75">Week Settlement</div>
              </div>
            </div>
            <Sparkles className="w-6 h-6 opacity-80" />
          </div>
          
          <div className="text-4xl font-bold mb-2">
            {loading ? (
              <div className="h-10 bg-white/20 rounded-lg animate-pulse"></div>
            ) : (
              `${actualSettlementAmount.toLocaleString()}원`
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm opacity-90">
            <span>승인 {statusStats.APPROVED.count}건</span>
            <span>수수료 {totalPlatformFee.toLocaleString()}원</span>
          </div>
        </div>
      </div>

      {/* 상태별 현황 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: 'APPROVED', ...getStatusInfo('APPROVED'), count: statusStats.APPROVED.count, amount: statusStats.APPROVED.amount },
          { key: 'PENDING', ...getStatusInfo('PENDING'), count: statusStats.PENDING.count, amount: statusStats.PENDING.amount },
          { key: 'REJECTED', ...getStatusInfo('REJECTED'), count: statusStats.REJECTED.count, amount: statusStats.REJECTED.amount }
        ].map((status) => {
          const StatusIcon = status.icon;
          return (
            <div key={status.key} className={`${status.bg} rounded-2xl p-4 border ${status.border}`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${status.gradient} flex items-center justify-center mb-3`}>
                <StatusIcon className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs text-gray-600 mb-1">{status.label}</div>
              <div className={`text-xl font-bold ${status.text} mb-1`}>
                {status.count}
              </div>
              <div className="text-xs text-gray-500">
                {status.amount.toLocaleString()}원
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default SettlementSummary;