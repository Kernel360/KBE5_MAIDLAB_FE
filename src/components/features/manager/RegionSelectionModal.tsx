import React from 'react';
import { X, MapPin } from 'lucide-react';
import { SEOUL_DISTRICT_LABELS } from '@/constants/region';

interface RegionSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRegions: { region: string }[];
  onRegionToggle: (region: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  title?: string;
  maxSelections?: number;
  showSelectAllButtons?: boolean;
}

const RegionSelectionModal: React.FC<RegionSelectionModalProps> = ({
  isOpen,
  onClose,
  selectedRegions,
  onRegionToggle,
  onSelectAll,
  onClearAll,
  title = '지역 선택',
  maxSelections,
  showSelectAllButtons = true,
}) => {
  if (!isOpen) return null;

  const isRegionSelected = (region: string) => {
    return selectedRegions.some((r) => r.region === region);
  };

  const handleRegionClick = (region: string) => {
    // 최대 선택 개수 체크
    if (
      maxSelections &&
      !isRegionSelected(region) &&
      selectedRegions.length >= maxSelections
    ) {
      return; // 더 이상 선택할 수 없음
    }
    onRegionToggle(region);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative max-h-[80vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            {title}
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 선택 개수 표시 */}
        <div className="mb-3 text-sm text-gray-600">
          선택된 지역: {selectedRegions.length}개
          {maxSelections && ` / 최대 ${maxSelections}개`}
        </div>

        {/* 지역 선택 영역 */}
        <div className="flex flex-wrap gap-2 mb-4 max-h-48 overflow-y-auto">
          {Object.values(SEOUL_DISTRICT_LABELS).map((region) => {
            const isSelected = isRegionSelected(region);
            const isDisabled =
              maxSelections &&
              !isSelected &&
              selectedRegions.length >= maxSelections;

            return (
              <button
                key={region}
                onClick={() => handleRegionClick(region)}
                disabled={!!isDisabled}
                className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                  isSelected
                    ? 'bg-orange-500 text-white border-orange-500'
                    : isDisabled
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                {region}
              </button>
            );
          })}
        </div>

        {/* 전체 선택/해제 버튼 */}
        {showSelectAllButtons && (
          <div className="flex justify-between mb-4">
            <button
              onClick={onSelectAll}
              disabled={
                !!(maxSelections && selectedRegions.length >= maxSelections)
              }
              className="text-orange-500 font-medium text-sm hover:text-orange-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              전체 선택
            </button>
            <button
              onClick={onClearAll}
              className="text-gray-400 font-medium text-sm hover:text-gray-600 transition-colors"
            >
              전체 해제
            </button>
          </div>
        )}

        {/* 확인 버튼 */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default RegionSelectionModal;
