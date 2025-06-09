import { useState, useEffect, useCallback } from 'react';
import { setLocalStorage, getLocalStorage, removeLocalStorage } from '@/utils';

export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
  expiryMs?: number,
): [T, (value: T) => void, () => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = getLocalStorage<T>(key);
    return item !== null ? item : initialValue;
  });

  const setValue = useCallback(
    (value: T) => {
      setStoredValue(value);
      setLocalStorage(key, value, expiryMs);
    },
    [key, expiryMs],
  );

  const removeValue = useCallback(() => {
    setStoredValue(initialValue);
    removeLocalStorage(key);
  }, [key, initialValue]);

  // 스토리지 변경 감지 (다른 탭에서 변경될 때)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.storageArea === localStorage) {
        const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;
        setStoredValue(newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};
