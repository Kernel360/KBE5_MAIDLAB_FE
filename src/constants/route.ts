export const ROUTES = {
  // 공통 페이지
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  SOCIAL_SIGNUP: '/social-signup',
  GOOGLE_CALLBACK: '/google-callback',

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
    USERS: '/admin/users',
    MANAGERS: '/admin/managers',
    MANAGER_DETAIL: '/admin/users/manager/:id',
    CONSUMERS: '/admin/consumers',
    CONSUMER_DETAIL: '/admin/users/consumer/:id',
    RESERVATIONS: '/admin/reservations',
    RESERVATION_DETAIL: '/admin/reservations/:id',
    MATCHING: '/admin/matching',
    SETTLEMENTS: '/admin/settlements',
    EVENTS: '/admin/events',
    EVENT_CREATE: '/admin/events/create',
    EVENT_EDIT: '/admin/events/:id/edit',
    EVENT_DETAIL: '/admin/events/:id',
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

