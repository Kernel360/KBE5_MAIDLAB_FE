import AdminLogin from '../pages/admin/AdminLogin';
import UserList from '../pages/admin/UserList';
import ReservationList from '../pages/admin/ReservationList';
import EventList from '../pages/admin/EventList';
import BoardList from '../pages/admin/BoardList';
import AdminLayout from '../pages/admin/layout/AdminLayout';

export const ROUTES = {
  // 공통 페이지
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',

  // 소비자 페이지
  CONSUMER: {
    MYPAGE: '/consumer/mypage',
    PROFILE: '/consumer/profile',
    PROFILE_EDIT: '/consumer/profile/edit',
    RESERVATIONS: '/consumer/reservations',
    RESERVATION_DETAIL: '/consumer/reservations/:id',
    RESERVATION_CREATE: '/consumer/reservations/create',
    LIKED_MANAGERS: '/consumer/likes',
    BLACKLIST: '/consumer/blacklist',
  },

  // 매니저 페이지
  MANAGER: {
    MYPAGE: '/manager/mypage',
    PROFILE: '/manager/profile',
    PROFILE_EDIT: '/manager/profile/edit',
    PROFILE_CREATE: '/manager/profile/create',
    RESERVATIONS: '/manager/reservations',
    RESERVATION_DETAIL: '/manager/reservations/:id',
    REVIEWS: '/manager/reviews',
    MATCHING: '/manager/matching',
    SETTLEMENTS: '/manager/settlements',
  },

  // 관리자 페이지
  ADMIN: {
    DASHBOARD: '/admin',
    LOGIN: '/admin/login',
    MANAGERS: '/admin/managers',
    MANAGER_DETAIL: '/admin/managers/:id',
    CONSUMERS: '/admin/consumers',
    CONSUMER_DETAIL: '/admin/consumers/:id',
    RESERVATIONS: '/admin/reservations',
    RESERVATION_DETAIL: '/admin/reservations/:id',
    MATCHING: '/admin/matching',
    SETTLEMENTS: '/admin/settlements',
    EVENTS: '/admin/events',
    EVENT_CREATE: '/admin/events/create',
    EVENT_EDIT: '/admin/events/:id/edit',
    BOARDS: '/admin/boards',
    BOARD_DETAIL: '/admin/boards/:id',
  },

  // 기타 페이지
  EVENTS: '/events',
  EVENT_DETAIL: '/events/:id',
  BOARD: '/board',
  BOARD_CREATE: '/board/create',
  BOARD_EDIT: '/board/create',
  BOARD_DETAIL: '/board/:id',
  NOT_FOUND: '/404',
} as const;

export const ROUTE_COMPONENTS = {
  ADMIN: {
    LOGIN: AdminLogin,
    LAYOUT: AdminLayout,
    USERS: UserList,
    RESERVATIONS: ReservationList,
    EVENTS: EventList,
    BOARDS: BoardList,
  },
} as const;
