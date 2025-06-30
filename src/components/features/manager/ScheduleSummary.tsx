import React from 'react';
import { Clock } from 'lucide-react';
import { WEEKDAY_LABELS } from '@/constants/service';

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface ScheduleSummaryProps {
  schedules: TimeSlot[];
  label?: string;
}

const ScheduleSummary: React.FC<ScheduleSummaryProps> = ({ schedules }) => {
  if (schedules.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <Clock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">등록된 가능 시간이 없습니다</p>
      </div>
    );
  }

  return (
    <>
      {schedules.map((slot, idx) => (
        <div
          key={idx}
          className={`py-3 px-4 bg-gray-50 text-gray-900 rounded-lg ${idx > 0 ? 'mt-2' : ''}`}
        >
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="font-medium">
              {WEEKDAY_LABELS[slot.day as keyof typeof WEEKDAY_LABELS]}
            </span>
            <span>
              {slot.startTime} ~ {slot.endTime}
            </span>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
              {Math.max(
                0,
                (parseInt(slot.endTime.replace(':', '')) -
                  parseInt(slot.startTime.replace(':', ''))) /
                  100,
              )}
              시간
            </span>
          </div>
        </div>
      ))}
    </>
  );
};

export default ScheduleSummary;
