import { useRef } from 'react';
import { useToast } from '@/hooks/useToast';
import type { ImageInfo } from '@/types/domain/board';

interface ImageUploaderProps {
  images: File[];
  previewUrls: string[];
  onImagesChange: (files: File[]) => void;
  onPreviewUrlsChange: (urls: string[]) => void;
  existingImages?: ImageInfo[];
  onExistingImagesChange?: (images: ImageInfo[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export default function ImageUploader({
  images,
  previewUrls,
  onImagesChange,
  onPreviewUrlsChange,
  existingImages = [],
  onExistingImagesChange,
  maxImages = 3,
  maxSizeMB = 5,
}: ImageUploaderProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const maxSize = maxSizeMB * 1024 * 1024;

    // 이미지 개수 체크
    if (images.length + existingImages.length + files.length > maxImages) {
      showToast(
        `최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`,
        'error',
      );
      return;
    }

    // 파일 타입과 크기 체크
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        showToast('이미지 파일만 업로드할 수 있습니다.', 'error');
        return false;
      }
      if (file.size > maxSize) {
        showToast(`파일 크기는 ${maxSizeMB}MB 이하여야 합니다.`, 'error');
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // 미리보기 URL 생성
    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));
    onPreviewUrlsChange([...previewUrls, ...newPreviewUrls]);
    onImagesChange([...images, ...validFiles]);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    const newPreviewUrls = [...previewUrls];

    // 미리보기 URL 해제
    URL.revokeObjectURL(newPreviewUrls[index]);

    newImages.splice(index, 1);
    newPreviewUrls.splice(index, 1);

    onImagesChange(newImages);
    onPreviewUrlsChange(newPreviewUrls);
  };

  const handleRemoveExistingImage = (index: number) => {
    if (!onExistingImagesChange) return;

    const newExistingImages = [...existingImages];
    newExistingImages.splice(index, 1);
    onExistingImagesChange(newExistingImages);
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        이미지 첨부 (선택사항, 최대 {maxImages}개)
      </label>
      <div className="space-y-4">
        {/* 기존 이미지 미리보기 */}
        {existingImages.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {existingImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.imagePath}
                  alt={image.name}
                  className="w-full h-32 object-cover rounded-lg"
                />
                {onExistingImagesChange && (
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 새로 업로드한 이미지 미리보기 */}
        {previewUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`미리보기 ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 이미지 업로드 버튼 */}
        {images.length + existingImages.length < maxImages && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              multiple
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-orange-500 hover:text-orange-500 transition-colors"
            >
              이미지 선택하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
