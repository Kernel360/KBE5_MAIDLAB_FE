import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeekSelectorProps {
  currentWeek: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  loading?: boolean;
}

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

const formatDateCustom = (date: Date, format: string) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return format
    .replace('yyyy', String(year))
    .replace('MM', month)
    .replace('dd', day)
    .replace('M', String(date.getMonth() + 1));
};

const getKoreanWeekRange = (date: Date) => {
  const start = getMonday(date);
  const end = addWeeks(start, 1);
  return `${formatDateCustom(start, 'M.dd')} - ${formatDateCustom(end, 'M.dd')}`;
};

const WeekSelector: React.FC<WeekSelectorProps> = ({ 
  currentWeek, 
  onPrevWeek, 
  onNextWeek, 
  loading = false 
}) => {
  return (
    <div className="backdrop-blur-custom bg-white/80 rounded-2xl border border-white/20 p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <button
          onClick={onPrevWeek}
          className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200"
          disabled={loading}
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">정산 기간</div>
          <div className="text-lg font-bold text-gray-900">
            {getKoreanWeekRange(currentWeek)}
          </div>
        </div>
        
        <button
          onClick={onNextWeek}
          className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200"
          disabled={loading}
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default WeekSelector;