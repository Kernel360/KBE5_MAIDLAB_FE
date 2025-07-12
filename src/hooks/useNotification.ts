import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  type NotificationDto,
  NotificationTypeInfo,
} from '@/types/notification';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { env } from '@/config/env';

// 전역 상태 및 EventSource 인스턴스 (싱글톤)
let globalNotifications: NotificationDto[] = [];
let globalUnreadCount = 0;
let globalIsConnected = false;
let globalHeaderRefreshTrigger = 0;
let globalEventSource: EventSource | null = null;
let isConnectionInitialized = false; // 연결 초기화 플래그

// 상태 업데이트를 위한 리스너들
const stateListeners: Set<() => void> = new Set();

// 전역 상태 업데이트 함수들
const updateNotifications = (notifications: NotificationDto[]) => {
  globalNotifications = notifications;
  stateListeners.forEach((listener) => listener());
};

const updateUnreadCount = (count: number) => {
  globalUnreadCount = count;
  stateListeners.forEach((listener) => listener());
};

const updateIsConnected = (connected: boolean) => {
  globalIsConnected = connected;
  stateListeners.forEach((listener) => listener());
};

const updateHeaderRefreshTrigger = (trigger: number) => {
  globalHeaderRefreshTrigger = trigger;
  stateListeners.forEach((listener) => listener());
};

export const useNotification = () => {
  const [, forceUpdate] = useState({});
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  // 상태 변경시 리렌더링을 위한 리스너 등록
  useEffect(() => {
    const listener = () => forceUpdate({});
    stateListeners.add(listener);
    return () => {
      stateListeners.delete(listener);
    };
  }, []);

  // 읽지 않은 알림 조회
  const fetchUnreadNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        return;
      }

      const apiUrl = `${env.API_BASE_URL.replace(/\/$/, '')}/api/notifications/unread`;
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();

        // /unread API 응답을 NotificationDto 형식으로 변환
        const rawNotifications = data.data || [];
        const convertedNotifications = rawNotifications.map(
          (notificationData: any) => {
            const notification: NotificationDto = {
              id: notificationData.id,
              senderId: notificationData.senderId,
              senderType: notificationData.senderType,
              receiverId: notificationData.receiverId,
              receiverType: notificationData.receiverType,
              notificationType: notificationData.notificationType,
              title: notificationData.title,
              message: notificationData.message,
              relatedId: notificationData.relatedId || 0,
              isRead: notificationData.isRead,
              createdAt: notificationData.createdAt,
            };
            return notification;
          },
        );

        updateNotifications(convertedNotifications);
        updateUnreadCount(convertedNotifications.length);
      }
    } catch (error) {
      console.error('[SSE] 알림 조회 중 오류:', error);
    }
  }, []);

  // SSE 연결 (싱글톤)
  const connectSSE = useCallback(() => {
    // 이미 연결되어 있으면 새로 연결하지 않음
    if (globalEventSource) {
      if (globalEventSource.readyState === 1) {
        updateIsConnected(true);
        return;
      } else if (globalEventSource.readyState === 0) {
        return;
      } else {
        globalEventSource.close();
        globalEventSource = null;
      }
    }

    if (!isAuthenticated) {
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      return;
    }

    try {
      const sseUrl = `${env.API_BASE_URL.replace(/\/$/, '')}/api/notifications/connect?token=${token}`;

      globalEventSource = new EventSource(sseUrl);

      // Use addEventListener instead of onmessage for better reliability
      globalEventSource.addEventListener('open', (event) => {
        updateIsConnected(true);
      });

      // Listen for custom 'notification' event type
      globalEventSource.addEventListener('notification', (event) => {
        try {
          const notificationData = JSON.parse(event.data);

          // Convert to NotificationDto format if needed
          const notification: NotificationDto = {
            id: notificationData.id,
            senderId: notificationData.senderId,
            senderType: notificationData.senderType,
            receiverId: notificationData.receiverId,
            receiverType: notificationData.receiverType,
            notificationType: notificationData.notificationType,
            title: notificationData.title,
            message: notificationData.message,
            relatedId: notificationData.relatedId || 0,
            isRead: notificationData.isRead,
            createdAt: notificationData.createdAt,
          };

          updateNotifications([notification, ...globalNotifications]);

          const newUnreadCount = globalUnreadCount + 1;
          updateUnreadCount(newUnreadCount);

          // 헤더 새로고침 트리거
          const newTriggerValue = globalHeaderRefreshTrigger + 1;
          updateHeaderRefreshTrigger(newTriggerValue);

          // 토스트 메시지 표시
          const typeInfo = NotificationTypeInfo[notification.notificationType];
          const toastMessage = `🔔 ${typeInfo.title}: ${typeInfo.defaultMessage}`;
          showToast(toastMessage, 'info');
        } catch (error) {
          console.error('❌ [SSE] 메시지 파싱 실패:', error);
          console.error('🔍 파싱 실패한 원본 데이터:', event.data);
          console.error('📄 데이터 타입:', typeof event.data);
          console.error('📏 데이터 길이:', event.data?.length);
        }
      });

      globalEventSource.addEventListener('error', (error) => {
        // 연결 상태만 업데이트, 자동 재연결은 하지 않음
        if (globalEventSource?.readyState === 2) {
          updateIsConnected(false);
          globalEventSource = null;
        } else if (globalEventSource?.readyState === 0) {
          // 연결 중...
        } else {
          updateIsConnected(false);
        }
      });
    } catch (error) {
      console.error('[SSE] 연결 생성 중 오류:', error);
    }
  }, []); // 인증 상태 변경 시에만 실행

  // SSE 연결 해제 (싱글톤)
  const disconnectSSE = useCallback(async () => {
    if (globalEventSource) {
      globalEventSource.close();
      globalEventSource = null;
      updateIsConnected(false);

      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const apiUrl = `${env.API_BASE_URL.replace(/\/$/, '')}/api/notifications/disconnect`;
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        }
      } catch (error) {
        console.error('[SSE] 연결 해제 중 오류:', error);
      }
    }
  }, []);

  // 알림 읽음 처리
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        return;
      }

      const apiUrl = `${env.API_BASE_URL.replace(/\/$/, '')}/api/notifications/${notificationId}/read`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const updated = globalNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        );
        updateNotifications(updated);

        const newCount = Math.max(0, globalUnreadCount - 1);
        updateUnreadCount(newCount);
      } else {
        console.error(
          '[SSE] 읽음 처리 실패:',
          response.status,
          response.statusText,
        );
      }
    } catch (error) {
      console.error('[SSE] 읽음 처리 중 오류:', error);
    }
  }, []);

  // 모든 알림 읽음 처리
  const markAllAsRead = useCallback(async () => {
    const unreadNotifications = globalNotifications.filter((n) => !n.isRead);
    for (const notification of unreadNotifications) {
      await markAsRead(notification.id);
    }
  }, [markAsRead]);

  // 최초 1회만 연결 초기화 (리스너 활성화와 무관)
  useEffect(() => {
    if (isAuthenticated && !isConnectionInitialized) {
      isConnectionInitialized = true;
      fetchUnreadNotifications();
      connectSSE();
    } else if (!isAuthenticated && isConnectionInitialized) {
      isConnectionInitialized = false;
      disconnectSSE();
      updateNotifications([]);
      updateUnreadCount(0);
    }
  }, []); // 인증 상태 변경 시에만 실행

  // 컴포넌트 언마운트 시 리스너만 제거 (연결은 유지)
  useEffect(() => {
    return () => {
      // stateListeners에서 제거는 이미 위의 리스너 등록 useEffect에서 처리됨
      // 마지막 리스너가 제거될 때만 연결 해제하려면 추가 로직 필요
      // 현재는 연결을 유지하여 다른 컴포넌트가 사용할 수 있도록 함
    };
  }, []);

  // Force header refresh function
  const forceHeaderRefresh = useCallback(() => {
    updateHeaderRefreshTrigger(globalHeaderRefreshTrigger + 1);
  }, []);

  // Return global state values
  return {
    notifications: globalNotifications,
    unreadCount: globalUnreadCount,
    isConnected: globalIsConnected,
    headerRefreshTrigger: globalHeaderRefreshTrigger,
    markAsRead,
    markAllAsRead,
    fetchUnreadNotifications,
    forceHeaderRefresh,
  };
};
