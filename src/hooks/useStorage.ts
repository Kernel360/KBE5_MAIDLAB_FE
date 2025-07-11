import { useState, useEffect, useCallback } from 'react';
import {
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
  setSessionStorage,
  getSessionStorage,
  removeSessionStorage,
} from '@/utils/storage';

type StorageType = 'local' | 'session';

const getStorage = (type: StorageType) => {
  if (type === 'local')
    return {
      setItem: setLocalStorage,
      getItem: getLocalStorage,
      removeItem: removeLocalStorage,
    };
  if (type === 'session')
    return {
      setItem: setSessionStorage,
      getItem: getSessionStorage,
      removeItem: removeSessionStorage,
    };
  throw new Error('Invalid storage type');
};

export const useStorage = <T>(
  key: string,
  initialValue: T,
  type: StorageType,
  expiryMs?: number,
): [T, (value: T) => void, () => void] => {
  const storage = getStorage(type);

  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = storage.getItem<T>(key);
    return item !== null ? item : initialValue;
  });

  const setValue = useCallback(
    (value: T) => {
      setStoredValue(value);
      storage.setItem(key, value, expiryMs);
    },
    [key, expiryMs, storage],
  );

  const removeValue = useCallback(() => {
    setStoredValue(initialValue);
    storage.removeItem(key);
  }, [key, initialValue, storage]);

  // 스토리지 변경 감지 (다른 탭에서 변경될 때) - localStorage에만 해당
  useEffect(() => {
    if (type === 'local') {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === key && e.storageArea === window.localStorage) {
          const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;
          setStoredValue(newValue);
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [key, initialValue, type]);

  return [storedValue, setValue, removeValue];
};
