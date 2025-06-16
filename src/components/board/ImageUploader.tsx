import { useState, useRef } from 'react';
import { useToast } from '@/hooks/useToast';
import type { ImageDto } from '@/apis/board';

interface ImageUploaderProps {
  images: File[];
  previewUrls: string[];
  onImagesChange: (files: File[]) => void;
  onPreviewUrlsChange: (urls: string[]) => void;
  existingImages: ImageDto[];
  onExistingImagesChange: (images: ImageDto[]) => void;
  disabled?: boolean;
}

export default function ImageUploader({
  images,
  previewUrls,
  onImagesChange,
  onPreviewUrlsChange,
  existingImages,
  onExistingImagesChange,
  disabled = false,
}: ImageUploaderProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxImages = 3;
  const maxSizeMB = 5;

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const maxSize = maxSizeMB * 1024 * 1024;

    // 이미지 개수 체크
    if (images.length + existingImages.length + files.length > maxImages) {
      showToast(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`, 'error');
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
      <label className="block text-sm font-medium text-gray-700 mb-2">
        이미지 첨부 (선택사항, 최대 {maxImages}개)
      </label>
      <div className="space-y-4">
        {/* 이미지 미리보기 그리드 */}
        <div className="grid grid-cols-3 gap-4">
          {/* 기존 이미지 미리보기 */}
          {existingImages.map((image, index) => (
            <div key={`existing-${index}`} className="relative group">
              <img
                src={image.imagePath}
                alt={image.name}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemoveExistingImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={disabled}
              >
                ×
              </button>
            </div>
          ))}

          {/* 새로 업로드한 이미지 미리보기 */}
          {previewUrls.map((url, index) => (
            <div key={`new-${index}`} className="relative group">
              <img
                src={url}
                alt={`미리보기 ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={disabled}
              >
                ×
              </button>
            </div>
          ))}

          {/* 빈 이미지 슬롯 */}
          {Array.from({ length: maxImages - (existingImages.length + previewUrls.length) }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400"
            >
              이미지 추가 가능
            </div>
          ))}
        </div>

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
              disabled={disabled}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`w-full p-4 border-2 border-dashed rounded-lg
                ${disabled 
                  ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'border-blue-500 text-blue-500 hover:bg-blue-50'}`}
              disabled={disabled}
            >
              이미지 선택하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 