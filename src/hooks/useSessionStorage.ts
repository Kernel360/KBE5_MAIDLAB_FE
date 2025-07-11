import { useStorage } from './useStorage';

export const useSessionStorage = <T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void, () => void] => {
  return useStorage(key, initialValue, 'session');
};
