import { useState, useCallback } from 'react';
import {
  setSessionStorage,
  getSessionStorage,
  removeSessionStorage,
} from '@/utils';

export const useSessionStorage = <T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void, () => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = getSessionStorage<T>(key);
    return item !== null ? item : initialValue;
  });

  const setValue = useCallback(
    (value: T) => {
      setStoredValue(value);
      setSessionStorage(key, value);
    },
    [key],
  );

  const removeValue = useCallback(() => {
    setStoredValue(initialValue);
    removeSessionStorage(key);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};
