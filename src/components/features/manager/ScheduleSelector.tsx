import React from 'react';
import { Plus, X } from 'lucide-react';
import { WEEKDAY_LABELS } from '@/constants/service';
import CustomSelect from './CustomSelect';

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface ScheduleSelectorProps {
  schedules: TimeSlot[];
  timeSlots: string[];
  onUpdateTimeSlot: (index: number, field: string, value: string) => void;
  onAddTimeSlot: () => void;
  onRemoveTimeSlot: (index: number) => void;
  error?: string;
  touched?: boolean;
  onTouch?: () => void;
  label?: string;
  required?: boolean;
}

const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({
  schedules,
  timeSlots,
  onUpdateTimeSlot,
  onAddTimeSlot,
  onRemoveTimeSlot,
  error,
  touched,
  onTouch,
  label = '가능 시간',
  required = false,
}) => {
  const handleAddTimeSlot = () => {
    onAddTimeSlot();
    onTouch?.();
  };

  return (
    <div className="mt-8 mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* 시간 슬롯 카드들 */}
      <div className="space-y-3">
        {schedules.map((slot, idx) => (
          <div
            key={idx}
            className="bg-white border-2 border-gray-100 rounded-xl p-4 transition-all hover:border-orange-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-800">
                  시간 {idx + 1}
                </span>
              </div>
              <button
                onClick={() => onRemoveTimeSlot(idx)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* 요일 선택 */}
              <div>
                <CustomSelect
                  value={slot.day}
                  onChange={(day) => onUpdateTimeSlot(idx, 'day', day)}
                  options={Object.keys(WEEKDAY_LABELS)}
                  optionLabels={WEEKDAY_LABELS}
                  icon="calendar"
                  label="요일"
                  placeholder="요일 선택"
                />
              </div>

              {/* 시간 선택 */}
              <div className="grid grid-cols-2 gap-3">
                <CustomSelect
                  value={slot.startTime}
                  onChange={(time) => onUpdateTimeSlot(idx, 'startTime', time)}
                  options={timeSlots}
                  label="시작 시간"
                  placeholder="시작 시간"
                />
                <CustomSelect
                  value={slot.endTime}
                  onChange={(time) => onUpdateTimeSlot(idx, 'endTime', time)}
                  options={timeSlots}
                  label="종료 시간"
                  placeholder="종료 시간"
                />
              </div>

              {/* 시간 표시 요약 */}
              <div className="mt-2 p-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="font-semibold text-orange-800">
                    {WEEKDAY_LABELS[slot.day as keyof typeof WEEKDAY_LABELS]}
                  </span>
                  <span className="text-orange-700">
                    {slot.startTime} ~ {slot.endTime}
                  </span>
                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
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
            </div>
          </div>
        ))}
      </div>

      {/* 에러 메시지 */}
      {error && touched && (
        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {/* 시간 추가 버튼 */}
      <button
        onClick={handleAddTimeSlot}
        className="w-full mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-orange-500 hover:text-orange-500 flex items-center justify-center gap-2 transition-colors"
      >
        <Plus className="w-5 h-5" />
        시간 추가
      </button>

      {/* 도움말 */}
      {schedules.length === 0 && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg
              className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm">
              <p className="font-medium text-blue-700 mb-1">
                {label}을 추가해주세요
              </p>
              <p className="text-blue-600">
                서비스를 제공할 수 있는 요일과 시간대를 설정하면 고객이 예약할
                때 참고할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleSelector;
