import type { ThemeConfig, LanguageConfig } from './ui';

/**
 * 기본 ID 타입
 */
export type ID = string | number;

/**
 * 기본 엔티티 인터페이스
 */
export interface BaseEntity {
  id: ID;
  createdAt: string;
  updatedAt: string;
}

/**
 * 검색 조건
 */
export interface SearchCondition<T = unknown> {
  field: string;
  operator:
    | 'eq'
    | 'ne'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'like'
    | 'in'
    | 'between';
  value: T;
}

/**
 * 파일 정보
 */
export interface FileInfo {
  id?: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadedAt?: string;
}

/**
 * 위치 정보
 */
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

/**
 * 통계 데이터
 */
export interface StatData {
  label: string;
  value: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

/**
 * 차트 데이터 포인트
 */
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
}

/**
 * 사용자 환경설정
 */
export interface UserPreferences {
  theme: ThemeConfig;
  language: LanguageConfig;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisible: boolean;
    activityVisible: boolean;
  };
}

/**
 * 키-값 쌍
 */
export interface KeyValue<T = unknown> {
  key: string;
  value: T;
}

/**
 * 스토리지 아이템 (만료 시간 포함)
 */
export interface StorageItem<T> {
  value: T;
  expiry: number;
}
