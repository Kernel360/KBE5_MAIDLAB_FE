import { BOARD_TYPE_LABELS, BOARD_TYPE_ICONS, BOARD_TYPE_DESCRIPTIONS, type BoardType } from '@/constants/board';

interface BoardTypeSelectorProps {
  selectedType: BoardType;
  onTypeChange: (type: BoardType) => void;
}

export default function BoardTypeSelector({ selectedType, onTypeChange }: BoardTypeSelectorProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">문의 유형</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(BOARD_TYPE_LABELS).map(([type, label]) => (
          <button
            key={type}
            type="button"
            onClick={() => onTypeChange(type as BoardType)}
            className={`flex flex-col items-center p-4 rounded-lg border-2 transition-colors ${
              selectedType === type
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-200'
            }`}
          >
            <span className="text-2xl mb-2">{BOARD_TYPE_ICONS[type as BoardType]}</span>
            <span className="font-medium mb-1">{label}</span>
            <span className="text-xs text-gray-500 text-center">
              {BOARD_TYPE_DESCRIPTIONS[type as BoardType]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
} 