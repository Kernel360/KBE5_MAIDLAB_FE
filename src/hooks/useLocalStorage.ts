import { useStorage } from './useStorage';

export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
  expiryMs?: number,
): [T, (value: T) => void, () => void] => {
  return useStorage(key, initialValue, 'local', expiryMs);
};
