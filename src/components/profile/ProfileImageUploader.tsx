import { useRef, useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { uploadToS3 } from '@/utils/s3';

interface ProfileImageUploaderProps {
  currentImageUrl?: string;
  onImageChange: (file: File | null, imageUrl: string | null) => void;
  disabled?: boolean;
}

export default function ProfileImageUploader({
  currentImageUrl,
  onImageChange,
  disabled = false,
}: ProfileImageUploaderProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const maxSizeMB = 5;

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB)
    if (file.size > maxSizeMB * 1024 * 1024) {
      showToast(`이미지 크기는 ${maxSizeMB}MB 이하여야 합니다.`, 'error');
      return;
    }

    // 이미지 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일만 업로드 가능합니다.', 'error');
      return;
    }

    // 미리보기 URL 생성
    const previewUrl = URL.createObjectURL(file);
    setPreviewUrl(previewUrl);
    onImageChange(file, previewUrl);

    // 기존 미리보기 URL 정리
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  };

  const handleRemoveImage = () => {
    if (previewUrl && previewUrl !== currentImageUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onImageChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        프로필 이미지
      </label>
      <div className="flex items-center space-x-4">
        {/* 프로필 이미지 미리보기 */}
        <div className="relative">
          {previewUrl ? (
            <div className="relative group">
              <img
                src={previewUrl}
                alt="프로필 이미지 미리보기"
                className="w-32 h-32 object-cover rounded-full border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={disabled}
              >
                ×
              </button>
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
              <span className="text-gray-400">이미지 없음</span>
            </div>
          )}
        </div>

        {/* 이미지 업로드 버튼 */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
            disabled={disabled}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`px-4 py-2 border-2 rounded-lg
              ${disabled 
                ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'border-blue-500 text-blue-500 hover:bg-blue-50'}`}
            disabled={disabled}
          >
            {previewUrl ? '이미지 변경' : '이미지 선택'}
          </button>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        이미지 크기는 {maxSizeMB}MB 이하여야 합니다.
      </p>
    </div>
  );
} 