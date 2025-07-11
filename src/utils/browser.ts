import { BREAKPOINTS, type BreakpointKey } from '@/constants';

/**
 * Breakpoint 값을 가져오는 함수
 */
export const getBreakpointValue = (key: BreakpointKey): number => {
  const value = BREAKPOINTS[key];
  if (value === undefined) {
    console.warn(`Breakpoint key '${key}' not found. Returning 0.`);
    return 0;
  }
  return value;
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
