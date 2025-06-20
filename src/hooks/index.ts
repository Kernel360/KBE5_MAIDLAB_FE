// 인증 관련 훅
export { useAuth, AuthProvider } from './useAuth';
export { useAdminAuth } from './useAdminAuth';

// 테마 관련 훅
export { useTheme, ThemeProvider } from './useTheme';

// 폼 관련 훅
export { useForm } from './useForm';

// 데이터 관리 훅
export { useReservation } from './domain/useReservation';
export { useManager } from './domain/useManager';
export { useMatching } from './domain/useMatching';
export { useBoard } from './domain/useBoard';
export { useEvent } from './domain/useEvent';
export { useUser } from './domain/useUser';
export { useConsumer } from './domain/useConsumer';
export { useAdmin } from './domain/useAdmin';

// UI 관련 훅
export { useModal } from './useModal';
export { useToast, ToastProvider } from './useToast';
export { usePagination } from './usePagination';
export { useDebounce } from './useDebounce';

// 스토리지 관련 훅
export { useLocalStorage } from './useLocalStorage';
export { useSessionStorage } from './useSessionStorage';

// 유틸리티 훅
export { usePermission } from './usePermission';
export { useGeolocation } from './useGeolocation';
export { useFileUpload } from './useFileUpload';
export { useValidation } from './useValidation';

// 타입 정의 (useValidation에서 export된 타입들만)
export type {
  ValidatorKey,
  ValidatorFunction,
  ValidationRule,
} from './useValidation';
