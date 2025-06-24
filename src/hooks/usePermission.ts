import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { USER_TYPES } from '@/constants';

/**
 * 실제 프로젝트에 맞는 단순화된 권한 관리 훅
 * - 수요자/매니저: 토큰 기반 페이지 접근 제어
 * - 관리자: 별도 페이지 + 별도 인증
 * - 매니저 승인 상태: 미승인시 제한된 기능만
 */
export const usePermission = () => {
  const { userType, isAuthenticated, userInfo } = useAuth();

  // 매니저 승인 상태 확인
  const isManagerApproved = useMemo(() => {
    if (userType !== USER_TYPES.MANAGER) return true;
    return userInfo?.isVerified === 'APPROVED'; // 매니저 승인 상태
  }, [userType, userInfo]);

  // 기본 권한들 (실제 사용되는 것들만)
  const permissions = useMemo(() => {
    if (!isAuthenticated) {
      return {
        canAccessConsumerPages: false,
        canAccessManagerPages: false,
        canCreateReservation: false,
        canManageProfile: false,
        canUseFullFeatures: false,
      };
    }

    const isConsumer = userType === USER_TYPES.CONSUMER;
    const isManager = userType === USER_TYPES.MANAGER;

    return {
      // 페이지 접근 권한 (토큰 기반)
      canAccessConsumerPages: isConsumer,
      canAccessManagerPages: isManager,

      // 기능별 권한
      canCreateReservation: isConsumer, // 수요자만 예약 생성
      canManageProfile: isConsumer || isManager, // 둘 다 프로필 관리 가능

      // 매니저 승인 상태 기반 권한
      canUseFullFeatures: isConsumer || (isManager && isManagerApproved),
      canAcceptReservations: isManager && isManagerApproved,
      canViewEarnings: isManager && isManagerApproved,
    };
  }, [userType, isAuthenticated, isManagerApproved]);

  // 매니저 미승인시 허용되는 기능들
  const limitedManagerFeatures = useMemo(() => {
    if (userType !== USER_TYPES.MANAGER || isManagerApproved) {
      return null;
    }

    return {
      canViewProfile: true, // 프로필 조회만 가능
      canEditProfile: false, // 프로필 수정 불가
      canViewMainPage: true, // 메인페이지 접근 가능
      canAccessOtherFeatures: false, // 다른 기능 접근 불가
    };
  }, [userType, isManagerApproved]);

  // 단순한 권한 체크 함수
  const hasPermission = (permission: keyof typeof permissions): boolean => {
    return !!permissions[permission];
  };

  // 매니저 승인 상태 체크
  const requireManagerApproval = (): void => {
    if (userType === USER_TYPES.MANAGER && !isManagerApproved) {
      throw new Error('매니저 승인이 필요한 기능입니다.');
    }
  };

  // 페이지 접근 권한 체크
  const canAccessPage = (pageType: 'consumer' | 'manager'): boolean => {
    if (pageType === 'consumer') {
      return hasPermission('canAccessConsumerPages');
    }
    if (pageType === 'manager') {
      return hasPermission('canAccessManagerPages');
    }
    return false;
  };

  return {
    // 기본 권한들
    ...permissions,

    // 상태 정보
    isManagerApproved,
    limitedManagerFeatures,

    // 유틸리티 함수들
    hasPermission,
    requireManagerApproval,
    canAccessPage,

    // 직접 접근용 (자주 사용되는 것들)
    isConsumer: userType === USER_TYPES.CONSUMER,
    isManager: userType === USER_TYPES.MANAGER,
    isAuthenticated,
  };
};
