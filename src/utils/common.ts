import { getBreakpointValue } from '@/constants/ui';

/**
 * 딜레이 함수 (Promise 기반)
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * 디바운스 함수
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * 클립보드에 텍스트 복사
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  // 입력값 검증
  if (!text || typeof text !== 'string') {
    console.warn('copyToClipboard: 유효하지 않은 텍스트');
    return false;
  }

  try {
    // 최신 Clipboard API 사용 (HTTPS 필요)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 폴백: document.execCommand 사용
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.style.opacity = '0';

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const result = document.execCommand('copy');
        document.body.removeChild(textArea);
        return result;
      } catch (execError) {
        console.error('execCommand 복사 실패:', execError);
        document.body.removeChild(textArea);
        return false;
      }
    }
  } catch (error) {
    console.error('클립보드 복사 실패:', error);
    return false;
  }
};

/**
 * 랜덤 ID 생성
 */
export const generateId = (length: number = 8): string => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

/**
 * 배열에서 중복 제거
 */
export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

/**
 * 배열을 특정 키로 그룹화
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce(
    (groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    },
    {} as Record<string, T[]>,
  );
};

/**
 * 간단한 깊은 복사 (JSON 방식)
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * 빈 값인지 확인
 */
export const isEmpty = (value: any): boolean => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (value instanceof Date) return isNaN(value.getTime());
  if (typeof value === 'object') {
    // Set, Map 등도 고려
    if (value instanceof Set || value instanceof Map) {
      return value.size === 0;
    }
    return Object.keys(value).length === 0;
  }
  return false;
};

/**
 * 범위 내 랜덤 숫자 생성
 */
export const randomBetween = (min: number, max: number): number => {
  if (min > max) {
    throw new Error('min은 max보다 작거나 같아야 합니다.');
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 화면 크기 확인
 */
export const getScreenSize = () => {
  const width = window.innerWidth;
  const mdBreakpoint = getBreakpointValue('MD');
  const lgBreakpoint = getBreakpointValue('LG');

  return {
    isMobile: width < mdBreakpoint,
    isTablet: width >= mdBreakpoint && width < lgBreakpoint,
    isDesktop: width >= lgBreakpoint,
  };
};

/**
 * 온라인 상태 확인
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * 스크롤 맨 위로
 */
export const scrollToTop = (): void => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};
