// 기본 페이지들
export { default as Home } from './Home';
export { default as Login } from './Login';
export { default as SignUp } from './SignUp';
export { default as NotFound } from './NotFound';

// 구글 로그인
export { default as GoogleCallback } from './GoogleCallback';
export { default as SocialSignUp } from './SocialSignUp';

// 이벤트 페이지 (나중에 구현)
// export { default as Events } from './Events';
// export { default as EventDetail } from './EventDetail';

// 게시판 페이지 (나중에 구현)
// export { default as Board } from './Board';
// export { default as BoardCreate } from './BoardCreate';
export { default as BoardDetail } from '@/pages/admin/BoardDetail';

// 소비자 페이지 (나중에 구현)
export { default as ConsumerProfileSetup } from './ConsumerProfileSetup';
export { default as ConsumerProfileEdit } from './consumer/ProfileEdit';
// export { default as ConsumerMyPage } from './consumer/MyPage';
// export { default as ConsumerProfile } from './consumer/Profile';
// export { default as ConsumerReservations } from './consumer/Reservations';
// export { default as ReservationCreate } from './consumer/ReservationCreate';
// export { default as LikedManagers } from './consumer/LikedManagers';

// 매니저 페이지 (나중에 구현)
export { default as ManagerProfileSetup } from './ManagerProfileSetup';
// export { default as ManagerMyPage } from './manager/MyPage';
// export { default as ManagerProfile } from './manager/Profile';
// export { default as ManagerReservations } from './manager/Reservations';
// export { default as ManagerReviews } from './manager/Reviews';

// 관리자 페이지 (나중에 구현)
export { default as AdminLogin } from '@/pages/admin/AdminLogin';
export { default as AdminLayout } from '@/pages/admin/layout/AdminLayout';
export { default as AdminUserList } from '@/pages/admin/UserList';
export { default as AdminManagerDetail } from '@/pages/admin/ManagerDetail';
export { default as AdminConsumerDetail } from '@/pages/admin/ConsumerDetail';
export { default as AdminReservationList } from '@/pages/admin/ReservationList';
export { default as AdminReservationDetail } from '@/pages/admin/ReservationDetail';
export { default as AdminSettlementList } from '@/pages/admin/SettlementList';
export { default as AdminSettlementDetail } from '@/pages/admin/SettlementDetail';
export { default as AdminEvents } from '@/pages/admin/EventList';
export { default as AdminEventCreate } from '@/pages/admin/EventCreate';
export { default as AdminEventEdit } from '@/pages/admin/EventEdit';
export { default as AdminEventDetail } from '@/pages/admin/EventDetail';
export { default as AdminBoards } from '@/pages/admin/BoardList';
export { default as AdminBoardDetail } from '@/pages/admin/BoardDetail';
export { default as AdminBoardEdit } from '@/pages/admin/BoardEdit';
export { default as Dashboard } from '@/pages/admin/Dashboard';