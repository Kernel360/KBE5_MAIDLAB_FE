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
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
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
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
          {label}
        </label>
      )}

      {/* 선택된 값 표시 버튼 */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2.5 bg-white dark:bg-gray-700 border rounded-lg text-left flex items-center justify-between transition-all duration-200 ${
          disabled
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-700'
            : isOpen
              ? 'border-orange-500 ring-1 ring-orange-200 dark:ring-orange-800 shadow-md'
              : 'border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2">
          <IconComponent className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span
            className={`text-sm font-medium ${value ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}
          >
            {value ? getDisplayText(value) : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* 드롭다운 옵션들 */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full px-3 py-2.5 text-left hover:bg-orange-50 dark:hover:bg-orange-900/50 transition-colors duration-150 ${
                  value === option
                    ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <IconComponent className="w-3 h-3 text-gray-400 dark:text-gray-500" />
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
