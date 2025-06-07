import {
  STORAGE_KEYS,
  SESSION_KEYS,
  STORAGE_EXPIRY,
} from '@/constants/storage';

/**
 * 만료 시간과 함께 데이터를 저장하는 인터페이스
 */
interface StorageItem<T> {
  value: T;
  expiry: number;
}

/**
 * 로컬스토리지에 데이터 저장 (만료 시간 포함)
 */
export const setLocalStorage = <T>(
  key: string,
  value: T,
  expiryMs?: number,
): void => {
  try {
    const expiry = expiryMs
      ? Date.now() + expiryMs
      : Date.now() + STORAGE_EXPIRY.USER_INFO;
    const item: StorageItem<T> = { value, expiry };

    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

/**
 * 로컬스토리지에서 데이터 가져오기 (만료 시간 체크)
 */
export const getLocalStorage = <T>(key: string): T | null => {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item: StorageItem<T> = JSON.parse(itemStr);

    // 만료 시간 체크
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  } catch (error) {
    console.error('Failed to get from localStorage:', error);
    return null;
  }
};

/**
 * 로컬스토리지에서 데이터 삭제
 */
export const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
};

/**
 * 만료된 로컬스토리지 항목들 정리
 */
export const clearExpiredLocalStorage = (): void => {
  try {
    const keys = Object.keys(localStorage);

    keys.forEach((key) => {
      try {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return;

        const item = JSON.parse(itemStr);
        if (item.expiry && Date.now() > item.expiry) {
          localStorage.removeItem(key);
        }
      } catch {
        // JSON 파싱 실패시 무시 (다른 앱의 데이터일 수 있음)
      }
    });
  } catch (error) {
    console.error('Failed to clear expired localStorage:', error);
  }
};

/**
 * 세션스토리지에 데이터 저장
 */
export const setSessionStorage = <T>(key: string, value: T): void => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to sessionStorage:', error);
  }
};

/**
 * 세션스토리지에서 데이터 가져오기
 */
export const getSessionStorage = <T>(key: string): T | null => {
  try {
    const itemStr = sessionStorage.getItem(key);
    return itemStr ? JSON.parse(itemStr) : null;
  } catch (error) {
    console.error('Failed to get from sessionStorage:', error);
    return null;
  }
};

/**
 * 세션스토리지에서 데이터 삭제
 */
export const removeSessionStorage = (key: string): void => {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from sessionStorage:', error);
  }
};

/**
 * 토큰 관리 유틸리티
 */
export const tokenStorage = {
  // 액세스 토큰 저장
  setAccessToken: (token: string): void => {
    setLocalStorage(
      STORAGE_KEYS.ACCESS_TOKEN,
      token,
      STORAGE_EXPIRY.ACCESS_TOKEN,
    );
  },

  // 액세스 토큰 가져오기
  getAccessToken: (): string | null => {
    return getLocalStorage<string>(STORAGE_KEYS.ACCESS_TOKEN);
  },

  // 리프레시 토큰 저장
  setRefreshToken: (token: string): void => {
    setLocalStorage(
      STORAGE_KEYS.REFRESH_TOKEN,
      token,
      STORAGE_EXPIRY.REFRESH_TOKEN,
    );
  },

  // 리프레시 토큰 가져오기
  getRefreshToken: (): string | null => {
    return getLocalStorage<string>(STORAGE_KEYS.REFRESH_TOKEN);
  },

  // 모든 토큰 삭제
  clearTokens: (): void => {
    removeLocalStorage(STORAGE_KEYS.ACCESS_TOKEN);
    removeLocalStorage(STORAGE_KEYS.REFRESH_TOKEN);
  },
};

/**
 * 사용자 정보 관리 유틸리티
 */
export const userStorage = {
  // 사용자 타입 저장
  setUserType: (userType: string): void => {
    setLocalStorage(STORAGE_KEYS.USER_TYPE, userType);
  },

  // 사용자 타입 가져오기
  getUserType: (): string | null => {
    return getLocalStorage<string>(STORAGE_KEYS.USER_TYPE);
  },

  // 사용자 정보 저장
  setUserInfo: (userInfo: any): void => {
    setLocalStorage(STORAGE_KEYS.USER_INFO, userInfo);
  },

  // 사용자 정보 가져오기
  getUserInfo: <T>(): T | null => {
    return getLocalStorage<T>(STORAGE_KEYS.USER_INFO);
  },

  // 모든 사용자 정보 삭제
  clearUserData: (): void => {
    removeLocalStorage(STORAGE_KEYS.USER_TYPE);
    removeLocalStorage(STORAGE_KEYS.USER_INFO);
  },
};

/**
 * 폼 데이터 임시 저장 유틸리티
 */
export const formStorage = {
  // 폼 데이터 저장
  saveFormData: <T>(formId: string, data: T): void => {
    setSessionStorage(`${SESSION_KEYS.FORM_DATA}_${formId}`, data);
  },

  // 폼 데이터 가져오기
  getFormData: <T>(formId: string): T | null => {
    return getSessionStorage<T>(`${SESSION_KEYS.FORM_DATA}_${formId}`);
  },

  // 폼 데이터 삭제
  clearFormData: (formId: string): void => {
    removeSessionStorage(`${SESSION_KEYS.FORM_DATA}_${formId}`);
  },
};

/**
 * 예약 초안 저장 유틸리티
 */
export const reservationDraftStorage = {
  // 예약 초안 저장
  saveDraft: <T>(data: T): void => {
    setSessionStorage(SESSION_KEYS.RESERVATION_DRAFT, data);
  },

  // 예약 초안 가져오기
  getDraft: <T>(): T | null => {
    return getSessionStorage<T>(SESSION_KEYS.RESERVATION_DRAFT);
  },

  // 예약 초안 삭제
  clearDraft: (): void => {
    removeSessionStorage(SESSION_KEYS.RESERVATION_DRAFT);
  },
};

/**
 * 최근 검색어 관리 유틸리티
 */
export const recentSearchStorage = {
  // 최근 검색어 추가
  addSearch: (searchTerm: string, maxCount: number = 10): void => {
    const recent =
      getLocalStorage<string[]>(STORAGE_KEYS.RECENT_SEARCHES) || [];

    // 중복 제거
    const filtered = recent.filter((term) => term !== searchTerm);

    // 맨 앞에 추가하고 최대 개수 제한
    const updated = [searchTerm, ...filtered].slice(0, maxCount);

    setLocalStorage(
      STORAGE_KEYS.RECENT_SEARCHES,
      updated,
      STORAGE_EXPIRY.RECENT_SEARCHES,
    );
  },

  // 최근 검색어 목록 가져오기
  getSearches: (): string[] => {
    return getLocalStorage<string[]>(STORAGE_KEYS.RECENT_SEARCHES) || [];
  },

  // 특정 검색어 삭제
  removeSearch: (searchTerm: string): void => {
    const recent =
      getLocalStorage<string[]>(STORAGE_KEYS.RECENT_SEARCHES) || [];
    const filtered = recent.filter((term) => term !== searchTerm);
    setLocalStorage(
      STORAGE_KEYS.RECENT_SEARCHES,
      filtered,
      STORAGE_EXPIRY.RECENT_SEARCHES,
    );
  },

  // 모든 검색어 삭제
  clearSearches: (): void => {
    removeLocalStorage(STORAGE_KEYS.RECENT_SEARCHES);
  },
};

/**
 * 브라우저 스토리지 지원 여부 확인
 */
export const storageSupport = {
  // 로컬스토리지 지원 여부
  localStorage: (): boolean => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },

  // 세션스토리지 지원 여부
  sessionStorage: (): boolean => {
    try {
      const test = '__storage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },
};
