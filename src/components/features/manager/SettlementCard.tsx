import React from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Home,
  Heart,
  Baby,
  ArrowUpRight,
  Eye,
} from 'lucide-react';
import type { SettlementResponse } from '@/types/reservation';

interface SettlementCardProps {
  settlement: SettlementResponse;
  onViewDetails: (reservationId: number) => void;
}

const getServiceTypeInfo = (serviceType: string) => {
  switch (serviceType) {
    case 'GENERAL_CLEANING':
      return {
        label: '일반청소',
        icon: Home,
        gradient: 'from-orange-500 to-orange-500',
      };
    case 'BABYSITTER':
      return {
        label: '베이비시터',
        icon: Baby,
        gradient: 'from-pink-500 to-rose-500',
      };
    case 'PET_CARE':
      return {
        label: '반려동물',
        icon: Heart,
        gradient: 'from-purple-500 to-violet-500',
      };
    default:
      return {
        label: '기타',
        icon: Clock,
        gradient: 'from-gray-500 to-slate-500',
      };
  }
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return {
        icon: CheckCircle,
        label: '승인완료',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
      };
    case 'PENDING':
      return {
        icon: Clock,
        label: '정산 대기중',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
      };
    case 'REJECTED':
      return {
        icon: XCircle,
        label: '거절됨',
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
      };
    default:
      return {
        icon: AlertCircle,
        label: '알 수 없음',
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
      };
  }
};

const SettlementCard: React.FC<SettlementCardProps> = ({
  settlement,
  onViewDetails,
}) => {
  const serviceInfo = getServiceTypeInfo(settlement.serviceType);
  const statusInfo = getStatusInfo(settlement.status);
  const ServiceIcon = serviceInfo.icon;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${serviceInfo.gradient} flex items-center justify-center`}
        >
          <ServiceIcon className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900 mb-1">
            {settlement.serviceDetailType}
          </div>
          <div className="text-sm text-gray-500">{serviceInfo.label}</div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text} border ${statusInfo.border}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusInfo.label}</span>
          </div>
          <button
            onClick={() => onViewDetails(settlement.reservationId)}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            title="예약 상세보기"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between pt-3 border-t border-gray-100">
        <div>
          <div className="text-xs text-gray-500 mb-1">플랫폼 수수료</div>
          <div className="text-sm font-medium text-blue-600">
            -{settlement.platformFee.toLocaleString()}원
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs text-gray-500">정산 금액</span>
            <ArrowUpRight className="w-3 h-3 text-gray-400" />
          </div>
          <div
            className={`text-2xl font-bold ${
              settlement.status === 'APPROVED'
                ? 'text-emerald-600'
                : settlement.status === 'PENDING'
                  ? 'text-amber-600'
                  : settlement.status === 'REJECTED'
                    ? 'text-red-600 line-through'
                    : 'text-gray-900'
            }`}
          >
            {settlement.amount.toLocaleString()}원
          </div>
          {settlement.status === 'REJECTED' && (
            <div className="text-xs text-red-500 mt-1">취소된 건</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettlementCard;
