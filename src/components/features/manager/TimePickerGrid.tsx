import React from 'react';
import { Clock } from 'lucide-react';

interface TimePickerGridProps {
  value: string;
  onChange: (time: string) => void;
  timeSlots: string[];
  label: string;
  disabled?: boolean;
}

const TimePickerGrid: React.FC<TimePickerGridProps> = ({
  value,
  onChange,
  timeSlots,
  label,
  disabled = false,
}) => {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-2">
        {label}
      </label>
      <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-gray-50">
        {timeSlots.map((time) => (
          <button
            key={time}
            type="button"
            onClick={() => onChange(time)}
            disabled={disabled}
            className={`p-2 text-xs font-medium rounded-md transition-all duration-200 ${
              value === time
                ? 'bg-orange-500 text-white shadow-md ring-2 ring-orange-200'
                : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 border border-gray-200 hover:border-orange-300'
            } ${
              disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              {time}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimePickerGrid;
