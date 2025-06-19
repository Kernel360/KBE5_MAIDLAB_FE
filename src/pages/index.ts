// 기본 페이지들
export { default as Home } from './common/Home';
export { default as Login } from './common/Login';
export { default as SignUp } from './common/SignUp';
export { default as NotFound } from './common/NotFound';

// 구글 로그인
export { default as GoogleCallback } from './common/GoogleCallback';
export { default as SocialSignUp } from './common/SocialSignUp';

// 이벤트 페이지
// export { default as Events } from './Events';
// export { default as EventDetail } from './EventDetail';

// 게시판 페이지 (나중에 구현)
// export { default as Board } from './Board';
// export { default as BoardCreate } from './BoardCreate';
export { default as BoardDetail } from '@/pages/admin/BoardDetail';

// 소비자 페이지
export { default as ConsumerProfileSetup } from './consumer/ConsumerProfileSetup';
export { default as ConsumerProfileEdit } from './consumer/ProfileEdit';
export { default as ConsumerMyPage } from './consumer/MyPage';
export { default as ConsumerProfile } from './consumer/Profile';

// 소비자 리뷰 등록 페이지
export { default as ConsumerReviewRegister } from './consumer/ConsumerReviewRegister';

// 수요자의 좋아요, 블랙리스트 매니저 페이지
export { default as ManagerList } from './consumer/ManagerList';

// 매니저 프로필 설정 페이지
export { default as ManagerProfileSetup } from './manager/ManagerProfileSetup';

// 매니저 마이 페이지
export { default as ManagerMyPage } from './manager/ManagerMyPage';


// 매니저 리뷰 등록 페이지
export { default as ManagerReviewRegister } from './manager/ManagerReviewRegister';

// 매니저 정산 페이지
export { default as ManagerSettlements } from './manager/ManagerSettlements';

// 수요자 예약 생성 페이지
export { default as ConsumerReservationCreate } from './reservation/ConsumerReservationCreate';

// 수요자 예약 상세 페이지
export { default as ConsumerReservationDetail } from './reservation/ConsumerReservationDetail';

// 수요자 전체 예약 페이지
export { default as ConsumerReservations } from './reservation/ConsumerReservations';

// 매니저 예약 상세 페이지
export { default as ManagerReservationDetail } from './reservation/ManagerReservationDetail';

// 매니저 전체 예약 페이지
export { default as ManagerReservations } from './reservation/ManagerReservations';

// 예약 매칭 페이지
export { default as ManagerMatching } from './matching/ManagerMatching';

// 관리자 페이지 로그인 페이지
export { default as AdminLogin } from '@/pages/admin/AdminLogin';

// 관리자 어쩌구 페이지...
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