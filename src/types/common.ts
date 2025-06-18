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
 * 선택 옵션
 */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

/**
 * 메뉴 아이템
 */
export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  disabled?: boolean;
}

/**
 * 브레드크럼 아이템
 */
export interface BreadcrumbItem {
  label: string;
  path?: string;
  active?: boolean;
}

/**
 * 탭 아이템
 */
export interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

/**
 * 테이블 컬럼
 */
export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
}

/**
 * 필터 옵션
 */
export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

/**
 * 검색 조건
 */
export interface SearchCondition {
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
  value: any;
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
 * 알림 메시지
 */
export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

/**
 * 모달 설정
 */
export interface ModalConfig {
  title?: string;
  width?: string | number;
  height?: string | number;
  closable?: boolean;
  maskClosable?: boolean;
  centered?: boolean;
}

/**
 * 폼 필드 설정
 */
export interface FormFieldConfig {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'url'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'date'
    | 'time'
    | 'file';
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  options?: SelectOption[];
  validation?: {
    pattern?: RegExp;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => boolean | string;
  };
}

/**
 * 테마 설정
 */
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
}

/**
 * 언어 설정
 */
export interface LanguageConfig {
  code: string;
  name: string;
  flag?: string;
  rtl?: boolean;
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
 * 오류 경계 정보
 */
export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: boolean;
}

/**
 * 로딩 상태
 */
export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

/**
 * 무한 스크롤 상태
 */
export interface InfiniteScrollState<T> {
  items: T[];
  hasMore: boolean;
  isLoading: boolean;
  error?: string;
}

/**
 * 드래그 앤 드롭 아이템
 */
export interface DragDropItem {
  id: string;
  type: string;
  data: any;
}

/**
 * 키-값 쌍
 */
export interface KeyValue<T = any> {
  key: string;
  value: T;
}

/**
 * 타임슬롯
 */
export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}
