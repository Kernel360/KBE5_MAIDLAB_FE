import { useState, useRef, useEffect, useMemo, memo } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '@/hooks/useNotification';
import { formatDateTime } from '@/utils/date';
import {
  getNotificationTitle,
  type NotificationDto,
} from '@/types/notification';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isConnected,
    headerRefreshTrigger,
    fetchUnreadNotifications,
    fetchNotifications,
  } = useNotification();

  // 헤더 새로고침 트리거 감지 - 이전 값과 비교하여 실제 변경 시에만 실행
  const prevHeaderRefreshTrigger = useRef(headerRefreshTrigger);

  useEffect(() => {
    if (
      headerRefreshTrigger > 0 &&
      headerRefreshTrigger !== prevHeaderRefreshTrigger.current
    ) {
      prevHeaderRefreshTrigger.current = headerRefreshTrigger;

      // 새로고침 시각적 효과
      setIsRefreshing(true);
      const timer = setTimeout(() => {
        setIsRefreshing(false);
      }, 500);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [headerRefreshTrigger]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Intersection Observer를 위한 ref와 상태
  const observerRef = useRef<IntersectionObserver | null>(null);
  const observedItemsRef = useRef<Set<number>>(new Set());

  // 무한스크롤 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 알림 항목이 화면에 표출될 때 읽음 처리
  useEffect(() => {
    if (!isOpen) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const notificationId = parseInt(
              entry.target.getAttribute('data-notification-id') || '0',
            );
            const isRead = entry.target.getAttribute('data-is-read') === 'true';

            if (
              notificationId &&
              !isRead &&
              !observedItemsRef.current.has(notificationId)
            ) {
              observedItemsRef.current.add(notificationId);
              markAsRead(notificationId);
            }
          }
        });
      },
      {
        threshold: 0.5, // 50% 이상 보일 때 읽음 처리
        rootMargin: '0px',
      },
    );

    // 모든 알림 항목에 observer 연결
    const notificationItems = document.querySelectorAll(
      '[data-notification-id]',
    );
    notificationItems.forEach((item) => {
      observerRef.current?.observe(item);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [isOpen, notifications, markAsRead]);

  // 드롭다운이 열릴 때 초기 데이터 로드
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(0);
      setHasMore(true);
      fetchNotifications(0, 10, true).then((result) => {
        setHasMore(result.hasMore);
      });
    } else {
      observedItemsRef.current.clear();
    }
  }, [isOpen, fetchNotifications]);

  // 무한스크롤 관찰자
  useEffect(() => {
    if (!isOpen || !hasMore || isLoadingMore) return;

    const loadMoreObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsLoadingMore(true);
          const nextPage = currentPage + 1;
          fetchNotifications(nextPage, 10, false).then((result) => {
            setCurrentPage(nextPage);
            setHasMore(result.hasMore);
            setIsLoadingMore(false);
          });
        }
      },
      { threshold: 1.0 },
    );

    if (loadMoreRef.current) {
      loadMoreObserver.observe(loadMoreRef.current);
    }

    return () => {
      loadMoreObserver.disconnect();
    };
  }, [isOpen, currentPage, hasMore, isLoadingMore, fetchNotifications]);

  const handleNotificationClick = async (notification: NotificationDto) => {
    const { id, isRead, relatedId, notificationType, receiverType } =
      notification;

    // 읽지 않은 알림이면 읽음 처리
    if (!isRead) {
      await markAsRead(id);
    }

    setIsOpen(false); // 드롭다운 닫기

    // 매니저용 알림 처리
    if (receiverType === 'MANAGER') {
      if (notificationType === 'MATCHING_REQUEST') {
        // 매칭 신청은 예약 요청 탭으로 이동
        navigate('/manager/reservations?tab=request');
      } else if (relatedId) {
        // 다른 알림들은 예약 상세페이지로 이동
        navigate(`/manager/reservations/${relatedId}`);
      }
    }
    // Consumer용 알림은 모두 예약 상세페이지로 이동
    else if (receiverType === 'CONSUMER' && relatedId) {
      navigate(`/consumer/reservations/${relatedId}`);
    }
  };

  // Memoize the service type color function
  const getServiceTypeColor = useMemo(
    () => (serviceType: string) => {
      switch (serviceType) {
        case '정기청소':
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        case '입주청소':
          return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case '사무실청소':
          return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      }
    },
    [],
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 알림 벨 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-all duration-300 ${
          isRefreshing ? 'animate-pulse scale-110' : ''
        }`}
      >
        <Bell
          className={`w-6 h-6 transition-all duration-300 ${
            isRefreshing ? 'text-orange-500' : ''
          }`}
        />
        {unreadCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center transition-all duration-300 ${
              isRefreshing ? 'animate-bounce' : ''
            }`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {/* 연결 상태 표시 */}
        <div
          className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-gray-400'
          } ${isRefreshing ? 'animate-ping' : ''}`}
        />
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[420px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
          {/* 헤더 */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">알림</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                >
                  <CheckCheck className="w-4 h-4 mr-1" />
                  모두 읽음
                </button>
              )}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              읽지 않음 {unreadCount}개
            </div>
          </div>

          {/* 알림 목록 */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p>새로운 알림이 없습니다</p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    data-notification-id={notification.id}
                    data-is-read={notification.isRead}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* 아이콘 */}
                      <div
                        className={`p-2 rounded-full ${
                          !notification.isRead ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'
                        }`}
                      >
                        <Bell
                          className={`w-4 h-4 ${
                            !notification.isRead
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-400 dark:text-gray-500'
                          }`}
                        />
                      </div>

                      {/* 알림 내용 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span
                                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getServiceTypeColor(notification.notificationType)}`}
                              >
                                {getNotificationTitle(
                                  notification.notificationType,
                                )}
                              </span>
                            </div>

                            <h4
                              className={`text-sm font-semibold mb-1 ${
                                !notification.isRead
                                  ? 'text-gray-900 dark:text-white'
                                  : 'text-gray-600 dark:text-gray-300'
                              }`}
                            >
                              {notification.title}
                            </h4>

                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                              {notification.message}
                            </p>
                          </div>

                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 ml-2" />
                          )}
                        </div>

                        {/* 시간 */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {formatDateTime(notification.createdAt)}
                          </span>
                          {notification.isRead && (
                            <Check className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 무한스크롤 로딩 트리거 */}
                {hasMore && (
                  <div ref={loadMoreRef} className="p-4 text-center">
                    {isLoadingMore ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          로딩 중...
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        스크롤하여 더 보기
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(NotificationDropdown);
