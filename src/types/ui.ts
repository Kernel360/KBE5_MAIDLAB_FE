import type React from 'react';

// UI 관련 타입
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  disabled?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  active?: boolean;
}

export interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

export interface TableColumn<T, K extends keyof T = keyof T> {
  key: K;
  title: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: T[K], record: T, index: number) => React.ReactNode;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

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

export interface ModalConfig {
  title?: string;
  width?: string | number;
  height?: string | number;
  closable?: boolean;
  maskClosable?: boolean;
  centered?: boolean;
}

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface LanguageConfig {
  code: string;
  name: string;
  flag?: string;
  rtl?: boolean;
}

export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface InfiniteScrollState<T> {
  items: T[];
  hasMore: boolean;
  isLoading: boolean;
  error?: string;
}

export interface DragDropItem<T = unknown> {
  id: string;
  type: string;
  data: T;
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
