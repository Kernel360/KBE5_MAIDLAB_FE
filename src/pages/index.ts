/**
 * common
 */

// 메인 홈페이지
export { default as Home } from './common/Home';

// 로그인 페이지
export { default as Login } from './common/Login';

// 회원가입 페이지
export { default as SignUp } from './common/SignUp';

// 404 페이지
export { default as NotFound } from './common/NotFound';

// 구글 콜백 페이지
export { default as GoogleCallback } from './common/GoogleCallback';

// 소셜 회원가입 페이지
export { default as SocialSignUp } from './common/SocialSignUp';

// 이벤트 리스트 페이지
export { default as EventList } from './common/EventList';

// 이벤트 상세 페이지
export { default as EventDetail } from './common/EventDetail';

/**
 * consumer
 */

// 수요자 프로필 등록 페이지
export { default as ConsumerProfileSetup } from './consumer/ConsumerProfileSetup';

// 수요자 프로필 수정 페이지
export { default as ConsumerProfileEdit } from './consumer/ProfileEdit';

// 수요자 마이페이지
export { default as ConsumerMyPage } from './consumer/MyPage';

// 수요자 프로필 페이지
export { default as ConsumerProfile } from './consumer/Profile';

// 수요자 리뷰 등록 페이지
export { default as ConsumerReviewRegister } from './consumer/ConsumerReviewRegister';

// 수요자의 찜한 매니저 조회
export { default as LikedManagerList } from './consumer/LikedManagerList';

// 수요자의 블랙리스트 매니저 조회
export { default as BlackListManagerList } from './consumer/BlackListManagerList';

// 수요자 포인트 페이지
export { default as PointsPage } from './consumer/PointsPage';

/**
 * manager
 */

// 매니저 프로필 설정 페이지
export { default as ManagerProfileSetup } from './manager/ManagerProfileSetup';

// 매니저 마이 페이지
export { default as ManagerMyPage } from './manager/ManagerMyPage';

// 매니저 프로필 조회 페이지
export { default as ManagerProfile } from './manager/ManagerProfile';

// 매니저 프로필 수정 페이지
export { default as ManagerProfileEdit } from './manager/ManagerProfileEdit';

// 매니저 리뷰 등록 페이지
export { default as ManagerReviewRegister } from './manager/ManagerReviewRegister';

// export { default as ManagerReservations } from './manager/Reservations';

// 매니저 리뷰 조회 페이지
export { default as ManagerReviews } from './manager/ManagerReviews';

// 매니저 정산 페이지
export { default as ManagerSettlements } from './manager/ManagerSettlements';

/**
 * reservation
 */

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

/**
 * board
 */

// 작성한 게시글 전체 조회
export { default as BoardList } from './board/BoardList';

// 게시글 작성
export { default as BoardCreate } from './board/BoardCreate';

// 게시글 상세 조회
export { default as BoardDetail } from './board/BoardDetail';

// 게시글 수정
export { default as BoardEdit } from './board/BoardEdit';

// 어드민용 게시판 상세
/**
 * admin
 */

// 관리자 로그인 페이지
export { default as AdminLogin } from '@/pages/admin/AdminLogin';

// 관리자 어쩌구 페이지...
export { default as AdminLayout } from '@/pages/admin/layout/AdminLayout';
export { default as AdminManagerList } from '@/pages/admin/ManagerList';
export { default as AdminManagerDetail } from '@/pages/admin/ManagerDetail';
export { default as AdminConsumerList } from '@/pages/admin/ConsumerList';
export { default as AdminConsumerDetail } from '@/pages/admin/ConsumerDetail';
export { default as AdminReservationList } from '@/pages/admin/ReservationList';
export { default as AdminReservationDetail } from '@/pages/admin/ReservationDetail';
export { default as AdminSettlementList } from '@/pages/admin/SettlementList';
export { default as AdminSettlementDetail } from '@/pages/admin/SettlementDetail';
export { default as AdminEvents } from '@/pages/admin/EventList';
export { default as AdminEventCreate } from '@/pages/admin/EventCreate';
export { default as AdminEventEdit } from '@/pages/admin/EventEdit';
export { default as AdminEventDetail } from '@/pages/admin/EventDetail';
export { default as AdminManagerBoards } from '@/pages/admin/ManagerBoard';
export { default as AdminConsumerBoards } from '@/pages/admin/ConsumerBoard';
export { default as AdminBoardDetail } from '@/pages/admin/BoardDetail';
export { default as AdminBoardEdit } from '@/pages/admin/BoardEdit';
export { default as Dashboard } from '@/pages/admin/Dashboard';
