/**
 * 알림 타입 enum
 */
export type NotificationType =
  // Manager용 알림
  | 'MATCHING_REQUEST'
  | 'RESERVATION_REMINDER'
  | 'RESERVATION_CANCELLED'
  | 'PAYMENT_CONFIRMED'

  // Consumer용 알림
  | 'MATCHING_APPROVED'
  | 'MATCHING_REJECTED'
  | 'MATCHING_EXPIRED'
  | 'PAYMENT_REMINDER'
  | 'SERVICE_CHECKIN'
  | 'SERVICE_COMPLETED'

  // 공통 알림
  | 'REVIEW_REQUEST'
  | 'SYSTEM_NOTICE'
  | 'POINT_EARNED'
  | 'POINT_USED'

  // 관리자용 알림
  | 'ADMIN_NOTICE';

/**
 * 알림 타입별 제목과 기본 메시지
 */
export const NotificationTypeInfo: Record<
  NotificationType,
  { title: string; defaultMessage: string }
> = {
  // Manager용 알림
  MATCHING_REQUEST: {
    title: '매칭 신청',
    defaultMessage: '새로운 매칭 신청이 들어왔습니다.',
  },
  RESERVATION_REMINDER: {
    title: '예약 알림',
    defaultMessage: '예약된 서비스 시간이 다가왔습니다.',
  },
  RESERVATION_CANCELLED: {
    title: '예약 취소',
    defaultMessage: '예약이 취소되었습니다.',
  },
  PAYMENT_CONFIRMED: {
    title: '결제 확인',
    defaultMessage: '매칭된 예약의 결제가 확인되었습니다.',
  },

  // Consumer용 알림
  MATCHING_APPROVED: {
    title: '매칭 승인',
    defaultMessage: '매칭 신청이 승인되었습니다.',
  },
  MATCHING_REJECTED: {
    title: '매칭 거절',
    defaultMessage: '매칭 신청이 거절되었습니다.',
  },
  MATCHING_EXPIRED: {
    title: '매칭 만료',
    defaultMessage: '매칭 신청이 만료되었습니다.',
  },
  PAYMENT_REMINDER: {
    title: '결제 알림',
    defaultMessage: '결제가 필요한 예약이 있습니다.',
  },
  SERVICE_CHECKIN: {
    title: '체크인',
    defaultMessage: '매칭 된 매니저가 작업을 시작했습니다.',
  },
  SERVICE_COMPLETED: {
    title: '서비스 완료',
    defaultMessage: '서비스가 완료되었습니다.',
  },

  // 공통 알림
  REVIEW_REQUEST: {
    title: '리뷰 요청',
    defaultMessage: '서비스에 대한 리뷰를 남겨주세요.',
  },
  SYSTEM_NOTICE: {
    title: '시스템 공지',
    defaultMessage: '시스템 공지사항이 있습니다.',
  },
  POINT_EARNED: {
    title: '포인트 적립',
    defaultMessage: '포인트가 적립되었습니다.',
  },
  POINT_USED: {
    title: '포인트 사용',
    defaultMessage: '포인트가 사용되었습니다.',
  },

  // 관리자용 알림
  ADMIN_NOTICE: {
    title: '관리자 공지',
    defaultMessage: '관리자 공지사항이 있습니다.',
  },
};

/**
 * 알림 DTO
 */
export interface NotificationDto {
  id: number;
  senderId: number;
  senderType: 'CONSUMER' | 'MANAGER' | 'ADMIN';
  receiverId: number;
  receiverType: 'CONSUMER' | 'MANAGER' | 'ADMIN';
  notificationType: NotificationType;
  title: string;
  message: string;
  relatedId: number;
  isRead: boolean;
  createdAt: string;
}

export const getNotificationTitle = (type: NotificationType): string => {
  return NotificationTypeInfo[type].title;
};
