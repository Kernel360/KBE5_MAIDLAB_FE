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
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * 암호학적으로 안전한 랜덤 ID 생성
 */
export const generateId = (length: number = 8): string => {
  // crypto.randomUUID()가 지원되는 경우 사용 (더 안전)
  if (crypto.randomUUID && length === 36) {
    return crypto.randomUUID();
  }

  // 커스텀 길이를 위한 crypto.getRandomValues() 사용
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
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
 * 구조화된 깊은 복사 (함수, Date, Map, Set 등도 지원)
 */
export const deepClone = <T>(obj: T): T => {
  // primitives
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Date
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  // Array
  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as T;
  }

  // Set
  if (obj instanceof Set) {
    const newSet = new Set();
    obj.forEach((item) => newSet.add(deepClone(item)));
    return newSet as T;
  }

  // Map
  if (obj instanceof Map) {
    const newMap = new Map();
    obj.forEach((value, key) => newMap.set(deepClone(key), deepClone(value)));
    return newMap as T;
  }

  // Object
  if (typeof obj === 'object') {
    const cloned = {} as T;
    Object.keys(obj).forEach((key) => {
      (cloned as any)[key] = deepClone((obj as any)[key]);
    });
    return cloned;
  }

  return obj;
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
