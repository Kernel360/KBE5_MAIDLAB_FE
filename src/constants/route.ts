export const ROUTES = {
  // 공통 페이지
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  SOCIAL_SIGNUP: '/social-signup',
  GOOGLE_CALLBACK: '/google-callback',
  GOOGLE_MAP: '/google-map',
  EVENTS: '/events',
  NOT_FOUND: '/404',
  EVENT_DETAIL: '/events/:id',

  // 소비자 페이지
  CONSUMER: {
    MYPAGE: '/consumer/mypage',
    PROFILE: '/consumer/profile',
    PROFILE_SETUP: '/consumer/profile/setup',
    PROFILE_EDIT: '/consumer/profile/edit',
    RESERVATIONS: '/consumer/reservations',
    RESERVATION_DETAIL: '/consumer/reservations/:id',
    RESERVATION_CREATE: '/consumer/reservations/create',
    REVIEW_REGISTER: '/consumers/reservations/:id/review',
    LIKED_MANAGERS: '/consumer/likes',
    BLACKLIST: '/consumer/blacklist',
    POINTS: '/consumer/points',
  },

  // 매니저 페이지
  MANAGER: {
    MYPAGE: '/manager/mypage',
    PROFILE: '/manager/profile',
    PROFILE_EDIT: '/manager/profile/edit',
    PROFILE_SETUP: '/manager/profile/setup',
    RESERVATIONS: '/manager/reservations',
    RESERVATION_DETAIL: '/manager/reservations/:id',
    REVIEW_REGISTER: '/managers/reservations/:id/review',
    REVIEWS: '/manager/reviews',
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
    SETTLEMENT_DETAIL: '/admin/settlements/:settlementId',
    EVENTS: '/admin/events',
    EVENT_CREATE: '/admin/events/create',
    EVENT_EDIT: '/admin/events/:id/edit',
    EVENT_DETAIL: '/admin/events/:id',
    MANAGER_BOARDS: '/admin/boards/manager',
    CONSUMER_BOARDS: '/admin/boards/consumer',
    BOARD_DETAIL: '/admin/boards/:id',
    BOARD_EDIT: '/admin/boards/:id/edit',
  },

  // 게시판 페이지
  BOARD: {
    LIST: '/board',
    CREATE: '/board/create',
    DETAIL: '/board/:id',
    EDIT: '/board/:id/edit',
  },
} as const;
