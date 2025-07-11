import React from 'react';
import { DollarSign } from 'lucide-react';

interface EmptyStateProps {
  selectedFilter: string;
  settlementStatusLabels: Record<string, string>;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  selectedFilter,
  settlementStatusLabels,
}) => {
  return (
    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <DollarSign className="w-8 h-8 text-gray-400" />
      </div>
      <div className="text-lg font-semibold text-gray-700 mb-2">
        {selectedFilter === 'ALL'
          ? '정산 내역이 없습니다'
          : `${settlementStatusLabels[selectedFilter]} 내역이 없습니다`}
      </div>
      <div className="text-sm text-gray-500">
        해당 기간에 정산 내역이 없습니다
      </div>
    </div>
  );
};

export default EmptyState;
