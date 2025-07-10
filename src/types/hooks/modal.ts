// 모달 관련 타입 정의

/**
 * 모달 상태 타입
 */
export interface ModalState {
  isOpen: boolean;
  data?: any;
}

/**
 * 모달 액션 타입
 */
export interface ModalActions {
  openModal: (data?: any) => void;
  closeModal: () => void;
  toggleModal: () => void;
}

/**
 * useModal 훅의 반환 타입
 */
export interface UseModalReturn extends ModalActions {
  isOpen: boolean;
  data?: any;
}

/**
 * 제네릭 모달 상태 타입 (타입 안전성을 위한)
 */
export interface GenericModalState<T = any> {
  isOpen: boolean;
  data?: T;
}

/**
 * 제네릭 모달 액션 타입
 */
export interface GenericModalActions<T = any> {
  openModal: (data?: T) => void;
  closeModal: () => void;
  toggleModal: () => void;
}

/**
 * 제네릭 useModal 훅의 반환 타입
 */
export interface GenericUseModalReturn<T = any> extends GenericModalActions<T> {
  isOpen: boolean;
  data?: T;
}

/**
 * 모달 설정 타입
 */
export interface ModalConfig {
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  preventScroll?: boolean;
  zIndex?: number;
}

/**
 * 모달 컴포넌트 프로퍼티 타입
 */
export interface ModalProps extends ModalConfig {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}
