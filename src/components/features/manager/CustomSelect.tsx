import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Clock, Calendar } from 'lucide-react';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  optionLabels?: Record<string, string>;
  icon?: 'clock' | 'calendar';
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = '선택하세요',
  label,
  disabled = false,
  optionLabels,
  icon = 'clock',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  const getDisplayText = (option: string) => {
    return optionLabels?.[option] || option;
  };

  const IconComponent = icon === 'calendar' ? Calendar : Clock;

  return (
    <div ref={selectRef} className="relative">
      {label && (
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          {label}
        </label>
      )}
      
      {/* 선택된 값 표시 버튼 */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2.5 bg-white border rounded-lg text-left flex items-center justify-between transition-all duration-200 ${
          disabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
            : isOpen
            ? 'border-orange-500 ring-2 ring-orange-200 shadow-md'
            : 'border-gray-300 hover:border-orange-400 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2">
          <IconComponent className="w-4 h-4 text-gray-400" />
          <span className={`text-sm font-medium ${value ? 'text-gray-700' : 'text-gray-400'}`}>
            {value ? getDisplayText(value) : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* 드롭다운 옵션들 */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full px-3 py-2.5 text-left hover:bg-orange-50 transition-colors duration-150 ${
                  value === option
                    ? 'bg-orange-100 text-orange-700 font-medium'
                    : 'text-gray-700 hover:text-orange-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <IconComponent className="w-3 h-3 text-gray-400" />
                  <span className="text-sm">{getDisplayText(option)}</span>
                  {value === option && (
                    <div className="ml-auto w-2 h-2 bg-orange-500 rounded-full"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;