// 인증 훅
export { useAuth, AuthProvider } from './useAuth';
export { useAdminAuth } from './useAdminAuth';

// 테마 관련 훅
export { useTheme, ThemeProvider } from './useTheme';

// 폼 관련 훅
export { useForm } from './useForm';

// api call 훅
export { useApiCall } from './useApiCall';

// 데이터 관리 훅
export { useBoard } from './domain/useBoard';
export { useConsumer } from './domain/useConsumer';
export { useEvent } from './domain/useEvent';
export { useManager } from './domain/useManager';
export { useMatching } from './domain/useMatching';
export { usePoint } from './domain/usePoint';
export { useReview } from './domain/useReview';
export { useUser } from './domain/useUser';

// Admin 관련 훅들
export {
  useAdminManagers,
  useAdminConsumers,
  useAdminReservations,
  useAdminBoard,
  useAdminMatching,
  useAdminDashboard,
} from './domain/admin';

// Reservation 관련 훅들
export {
  useReservation,
  useReservationCache,
  useReservationStatus,
  useReservationPagination,
  useManagerReservationPagination,
} from './domain/reservation';

// UI 관련 훅
export { useModal } from './useModal';
export { useToast, ToastProvider } from './useToast';
export { usePagination } from './usePagination';
export { useServerPagination } from './useServerPagination';
export { useDebounce } from './useDebounce';

// 스토리지 관련 훅
export { useLocalStorage } from './useLocalStorage';
export { useSessionStorage } from './useSessionStorage';
export { useStorage } from './useStorage';

// 유틸리티 훅
export { usePermission } from './usePermission';
export { useGeolocation } from './useGeolocation';
export { useFileUpload } from './useFileUpload';
export { useValidation } from './useValidation';

// 타입 정의
export type {
  ValidatorKey,
  ValidatorFunction,
  ValidationRule,
} from '@/types/hooks/validation';
