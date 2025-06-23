export { useAuth, AuthProvider } from './useAuth';
export { useAdminAuth } from './useAdminAuth';

// 테마 관련 훅
export { useTheme, ThemeProvider } from './useTheme';

// 폼 관련 훅
export { useForm } from './useForm';

// 🔧 새로 추가된 공통 훅들
export { useApiCall } from './useApiCall';
export { useReservationCache } from './useReservationCache';

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

// 🔧 중복 파일 정리 - domain 폴더의 useReservationStatus만 사용
export { useReservationStatus } from './domain/useReservationStatus';

// 타입 정의
export type {
  ValidatorKey,
  ValidatorFunction,
  ValidationRule,
} from './useValidation';
