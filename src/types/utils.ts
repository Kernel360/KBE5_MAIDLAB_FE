/**
 * 스토리지 아이템 타입
 */
export interface StorageItem<T> {
  value: T;
  expiry: number;
}

/**
 * S3 Presigned URL 응답 타입
 */
export interface PresignedUrlResponse {
  key: string;
  url: string; // presigned URL
}

/**
 * OAuth 팝업 설정 타입
 */
export interface PopupConfig {
  width: number;
  height: number;
  timeout: number;
  fastPollInterval: number;
  slowPollInterval: number;
  fastPollDuration: number;
}
