// 파일 업로드 관련 타입 정의

/**
 * 파일 업로드 상태 타입
 */
export interface FileUploadState {
  files: File[];
  previews: string[];
  uploading: boolean;
  progress: number;
}

/**
 * 파일 업로드 액션 타입
 */
export interface FileUploadActions {
  addFiles: (newFiles: FileList | File[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  upload: (uploadFn: (files: File[]) => Promise<any>) => Promise<any>;
}

/**
 * useFileUpload 훅의 반환 타입
 */
export interface UseFileUploadReturn extends FileUploadActions {
  files: File[];
  previews: string[];
  uploading: boolean;
  progress: number;
}

/**
 * 파일 업로드 옵션 타입
 */
export interface FileUploadOptions {
  maxFiles?: number;
  maxSize?: number;
  acceptedTypes?: string[];
  autoUpload?: boolean;
}

/**
 * 파일 검증 결과 타입
 */
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * 업로드된 파일 정보 타입
 */
export interface UploadedFile {
  id: string;
  originalName: string;
  fileName: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

/**
 * 파일 업로드 응답 타입
 */
export interface FileUploadResponse {
  success: boolean;
  files: UploadedFile[];
  errors?: string[];
}

/**
 * 파일 업로드 진행률 타입
 */
export interface UploadProgress {
  fileIndex: number;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

/**
 * 드래그 앤 드롭 상태 타입
 */
export interface DragDropState {
  isDragOver: boolean;
  isDragActive: boolean;
}

/**
 * 파일 타입 제한 설정
 */
export interface FileTypeRestriction {
  accept: string;
  maxSize: number;
  description: string;
}

/**
 * 이미지 파일 미리보기 타입
 */
export interface ImagePreview {
  file: File;
  url: string;
  width?: number;
  height?: number;
}
