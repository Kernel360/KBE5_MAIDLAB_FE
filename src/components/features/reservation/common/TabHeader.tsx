import React from 'react';

interface TabHeaderProps {
  tab: 'schedule' | 'request';
  setTab: (tab: 'schedule' | 'request') => void;
  filter: string;
  setFilter: (filter: any) => void;
  filterDropdown: React.ReactNode;
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
}

export const TabHeader: React.FC<TabHeaderProps> = ({
  tab,
  setTab,
  filter,
  setFilter,
  filterDropdown,
  filterOpen,
  setFilterOpen,
}) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 pt-2 pb-2 sticky top-0 z-20">
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
  );
};

export default TabHeader; 