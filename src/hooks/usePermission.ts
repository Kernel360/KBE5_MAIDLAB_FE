import { useMemo, useCallback } from 'react';
import { useAuth } from './useAuth';
import { USER_TYPES } from '@/constants';

interface Permission {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
}

type ResourceName =
  | 'profile'
  | 'reservation'
  | 'review'
  | 'board'
  | 'event'
  | 'default';

type PermissionMap = {
  [USER_TYPES.ADMIN]: Record<ResourceName, Permission>;
  [USER_TYPES.MANAGER]: Record<ResourceName, Permission>;
  [USER_TYPES.CONSUMER]: Record<ResourceName, Permission>;
};

export const usePermission = () => {
  const { userType, isAuthenticated } = useAuth();

  // 리소스별 권한 정의
  const getResourcePermissions = useCallback(
    (resource: string): Permission => {
      if (!isAuthenticated || !userType) {
        return {
          canView: false,
          canEdit: false,
          canDelete: false,
          canCreate: false,
        };
      }

      const permissionMap: PermissionMap = {
        [USER_TYPES.ADMIN]: {
          // 관리자는 모든 권한
          profile: {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
          },
          reservation: {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
          },
          review: {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
          },
          board: {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
          },
          event: {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
          },
          default: {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
          },
        },
        [USER_TYPES.MANAGER]: {
          profile: {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: true,
          },
          reservation: {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: false,
          },
          review: {
            canView: true,
            canEdit: false,
            canDelete: false,
            canCreate: false,
          },
          board: {
            canView: true,
            canEdit: false,
            canDelete: false,
            canCreate: false,
          },
          event: {
            canView: true,
            canEdit: false,
            canDelete: false,
            canCreate: false,
          },
          default: {
            canView: true,
            canEdit: false,
            canDelete: false,
            canCreate: false,
          },
        },
        [USER_TYPES.CONSUMER]: {
          profile: {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: true,
          },
          reservation: {
            canView: true,
            canEdit: false,
            canDelete: true,
            canCreate: true,
          },
          review: {
            canView: true,
            canEdit: false,
            canDelete: false,
            canCreate: true,
          },
          board: {
            canView: true,
            canEdit: false,
            canDelete: false,
            canCreate: true,
          },
          event: {
            canView: true,
            canEdit: false,
            canDelete: false,
            canCreate: false,
          },
          default: {
            canView: true,
            canEdit: false,
            canDelete: false,
            canCreate: false,
          },
        },
      };

      const userPermissions = permissionMap[userType];

      // 타입 안전한 방식으로 리소스 권한 가져오기
      if (userPermissions && resource in userPermissions) {
        return userPermissions[resource as ResourceName];
      }

      // 기본 권한 반환
      return (
        userPermissions?.default || {
          canView: false,
          canEdit: false,
          canDelete: false,
          canCreate: false,
        }
      );
    },
    [userType, isAuthenticated],
  );

  // 기본 권한들
  const permissions = useMemo(() => {
    if (!isAuthenticated || !userType) {
      return {
        canAccessConsumerPages: false,
        canAccessManagerPages: false,
        canAccessAdminPages: false,
        canCreateReservation: false,
        canManageReservations: false,
        canManageManagers: false,
        canViewAllData: false,
      };
    }

    return {
      canAccessConsumerPages: userType === USER_TYPES.CONSUMER,
      canAccessManagerPages: userType === USER_TYPES.MANAGER,
      canAccessAdminPages: userType === USER_TYPES.ADMIN,
      canCreateReservation: userType === USER_TYPES.CONSUMER,
      canManageReservations: userType === USER_TYPES.MANAGER,
      canManageManagers: userType === USER_TYPES.ADMIN,
      canViewAllData: userType === USER_TYPES.ADMIN,
    };
  }, [userType, isAuthenticated]);

  // 특정 권한 확인
  const hasPermission = useCallback(
    (permission: keyof typeof permissions) => {
      return permissions[permission];
    },
    [permissions],
  );

  // 리소스별 액션 권한 확인
  const hasResourcePermission = useCallback(
    (
      resource: string,
      action: 'view' | 'edit' | 'delete' | 'create',
    ): boolean => {
      const resourcePermission = getResourcePermissions(resource);

      switch (action) {
        case 'view':
          return resourcePermission.canView;
        case 'edit':
          return resourcePermission.canEdit;
        case 'delete':
          return resourcePermission.canDelete;
        case 'create':
          return resourcePermission.canCreate;
        default:
          return false;
      }
    },
    [getResourcePermissions],
  );

  // 권한 요구 (에러 던지기)
  const requirePermission = useCallback(
    (permission: keyof typeof permissions) => {
      if (!hasPermission(permission)) {
        throw new Error(`권한이 없습니다: ${permission}`);
      }
    },
    [hasPermission],
  );

  // 리소스 권한 요구 (에러 던지기)
  const requireResourcePermission = useCallback(
    (resource: string, action: 'view' | 'edit' | 'delete' | 'create') => {
      if (!hasResourcePermission(resource, action)) {
        throw new Error(`${resource}에 대한 ${action} 권한이 없습니다.`);
      }
    },
    [hasResourcePermission],
  );

  return {
    ...permissions,
    hasPermission,
    hasResourcePermission,
    requirePermission,
    requireResourcePermission,
    getResourcePermissions,
  };
};
