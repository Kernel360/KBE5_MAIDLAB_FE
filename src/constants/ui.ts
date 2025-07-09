// 페이지네이션 기본값
export const PAGINATION_DEFAULTS = {
  PAGE: 0,
  SIZE: 10,
  SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// 애니메이션 지속시간 (ms)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// 지연시간 (ms)
export const DEBOUNCE_DELAY = {
  SEARCH: 300,
  RESIZE: 100,
  SCROLL: 50,
} as const;

// 언어 설정
export const LANGUAGES = {
  KO: 'ko',
  EN: 'en',
} as const;

export type LanguageType = (typeof LANGUAGES)[keyof typeof LANGUAGES];

// 애플리케이션 메타 정보
export const APP_INFO = {
  NAME: 'MaidLab',
  VERSION: '1.0.0',
  DESCRIPTION: '가사도우미 및 돌봄서비스 플랫폼',
  AUTHOR: 'MaidLab Team',
  CONTACT_EMAIL: 'support@maidlab.com',
  COMPANY: 'MaidLab Inc.',
} as const;

// 브레이크포인트 유틸리티 함수 (theme.ts의 값 사용)
import { BREAKPOINTS } from './theme';

/**
 * 브레이크포인트 값을 숫자로 변환 (px 제거)
 */
export const getBreakpointValue = (
  breakpoint: keyof typeof BREAKPOINTS,
): number => {
  return parseInt(BREAKPOINTS[breakpoint].replace('px', ''), 10);
};

/**
 * 현재 화면 크기가 지정된 브레이크포인트보다 큰지 확인
 */
export const isAboveBreakpoint = (
  breakpoint: keyof typeof BREAKPOINTS,
): boolean => {
  if (typeof window === 'undefined') return false;

  const breakpointValue = getBreakpointValue(breakpoint);
  return window.innerWidth >= breakpointValue;
};

/**
 * 현재 화면 크기에 해당하는 브레이크포인트 반환
 */
export const getCurrentBreakpoint = (): keyof typeof BREAKPOINTS => {
  if (typeof window === 'undefined') return 'SM';

  const width = window.innerWidth;

  if (width >= getBreakpointValue('2XL')) return '2XL';
  if (width >= getBreakpointValue('XL')) return 'XL';
  if (width >= getBreakpointValue('LG')) return 'LG';
  if (width >= getBreakpointValue('MD')) return 'MD';
  if (width >= getBreakpointValue('SM')) return 'SM';

  return 'XS';
};
