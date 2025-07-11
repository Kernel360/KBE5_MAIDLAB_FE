import React from 'react';

interface StatusStats {
  APPROVED: { count: number; amount: number };
  PENDING: { count: number; amount: number };
  REJECTED: { count: number; amount: number };
}

interface StatusFilterProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  totalCount: number;
  statusStats: StatusStats;
}

const StatusFilter: React.FC<StatusFilterProps> = ({
  selectedFilter,
  onFilterChange,
  totalCount,
  statusStats,
}) => {
  const filters = [
    { key: 'ALL', label: '전체', count: totalCount },
    { key: 'APPROVED', label: '승인', count: statusStats.APPROVED.count },
    { key: 'PENDING', label: '대기', count: statusStats.PENDING.count },
    { key: 'REJECTED', label: '거절', count: statusStats.REJECTED.count },
  ];

  return (
    <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
      <div className="flex gap-1">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              selectedFilter === filter.key
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div>{filter.label}</div>
            <div className="text-xs opacity-75">{filter.count}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StatusFilter;
