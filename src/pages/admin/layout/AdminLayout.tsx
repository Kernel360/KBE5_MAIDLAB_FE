import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { AdminThemeProvider } from '@/components/features/admin/AdminThemeProvider';

const PeopleIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const CampaignIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

const AccountBalanceIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
);

const PieChartIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const menuItems = [
  { text: '대시보드', icon: <PieChartIcon />, path: '/admin' },
  {
    text: '수요자 관리',
    icon: <PeopleIcon />,
    path: '/admin/consumers',
    subItems: [
      { text: '수요자 목록', path: '/admin/consumers' },
      { text: '수요자 문의 목록', path: '/admin/boards/consumer' },
    ],
  },
  {
    text: '매니저 관리',
    icon: <PeopleIcon />,
    path: '/admin/managers',
    subItems: [
      { text: '매니저 목록', path: '/admin/managers' },
      { text: '매니저 문의 목록', path: '/admin/boards/manager' },
    ],
  },
  { text: '예약 관리', icon: <CalendarIcon />, path: '/admin/reservations' },
  {
    text: '정산 관리',
    icon: <AccountBalanceIcon />,
    path: '/admin/settlements',
  },
  { text: '이벤트 관리', icon: <CampaignIcon />, path: '/admin/events' },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleMenuClick = (item: any) => {
    if (item.subItems) {
      // Close other submenus and toggle current one
      const otherMenus = menuItems
        .filter((menuItem) => menuItem.text !== item.text && menuItem.subItems)
        .map((menuItem) => menuItem.text);

      setExpandedMenus((prev) => {
        // Remove other menus and toggle current menu
        const withoutOthers = prev.filter(
          (menuText) => !otherMenus.includes(menuText),
        );
        const isCurrentExpanded = prev.includes(item.text);

        if (isCurrentExpanded) {
          // If current menu is expanded, close it
          return withoutOthers.filter((menuText) => menuText !== item.text);
        } else {
          // If current menu is closed, open it
          return [...withoutOthers, item.text];
        }
      });

      navigate(item.path);
    } else {
      // Close all submenus when navigating to a different main menu
      setExpandedMenus([]);
      navigate(item.path);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      //await adminApi.logout(); // API 호출을 먼저 수행

      // 로컬 스토리지 직접 정리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userType');
      sessionStorage.clear();

      // 쿠키 정리
      document.cookie.split(';').forEach(function (c) {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });

      // 강제 페이지 새로고침으로 완전한 리셋
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('로그아웃 중 오류가 발생했습니다:', error);
      // 에러 시에도 강제 정리
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/admin/login';
    }
  };

  if (isLoggingOut) {
    return (
      <AdminThemeProvider>
        <div className="flex h-screen bg-gray-50 items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">로그아웃 중...</p>
          </div>
        </div>
      </AdminThemeProvider>
    );
  }

  return (
    <AdminThemeProvider>
      <div className="flex h-screen bg-gray-50">
        {/* 사이드바 - 항상 표시 */}
        <div className="w-80 bg-gray-800 shadow-lg flex-shrink-0">
          <div className="h-full flex flex-col">
            {/* 사이드바 상단 타이틀 */}
            <div className="h-16 flex items-center px-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">
                MAIDLAB 관리자
              </h2>
            </div>

            {/* 메뉴 리스트 */}
            <nav className="flex-1 px-4 py-4 space-y-1">
              {menuItems.map((item) => {
                const isExpanded = expandedMenus.includes(item.text);
                const isActive = location.pathname === item.path;
                const hasActiveSubItem = item.subItems?.some(
                  (subItem) => location.pathname === subItem.path,
                );

                return (
                  <div key={item.text}>
                    <button
                      onClick={() => handleMenuClick(item)}
                      className={`
                        w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-colors duration-200
                        ${
                          isActive || hasActiveSubItem
                            ? 'bg-gray-600 text-white shadow-md'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }
                      `}
                    >
                      <div className="flex items-center">
                        <span
                          className={`mr-3 ${isActive || hasActiveSubItem ? 'text-white' : 'text-gray-400'}`}
                        >
                          {item.icon}
                        </span>
                        <span className="font-medium">{item.text}</span>
                      </div>
                      {item.subItems && (
                        <span
                          className={`${isActive || hasActiveSubItem ? 'text-white' : 'text-gray-400'}`}
                        >
                          {isExpanded ? (
                            <ChevronDownIcon />
                          ) : (
                            <ChevronRightIcon />
                          )}
                        </span>
                      )}
                    </button>

                    {/* 서브메뉴 */}
                    {item.subItems && isExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.subItems.map((subItem) => {
                          const isSubActive =
                            location.pathname === subItem.path;
                          return (
                            <button
                              key={subItem.text}
                              onClick={() => {
                                // Keep current submenu open but close others
                                const otherMenus = menuItems
                                  .filter(
                                    (menuItem) =>
                                      menuItem.text !== item.text &&
                                      menuItem.subItems,
                                  )
                                  .map((menuItem) => menuItem.text);
                                setExpandedMenus((prev) =>
                                  prev.filter(
                                    (menuText) =>
                                      !otherMenus.includes(menuText),
                                  ),
                                );
                                navigate(subItem.path);
                              }}
                              className={`
                                w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors duration-200 text-sm
                                ${
                                  isSubActive
                                    ? 'bg-gray-600 text-white shadow-md'
                                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                }
                              `}
                            >
                              <span className="ml-6 font-medium">
                                {subItem.text}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* 로그아웃 버튼 - 사이드바 하단 */}
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200"
              >
                <LogoutIcon />
                <span className="ml-2 font-medium">로그아웃</span>
              </button>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 min-w-0">
          <main className="h-full overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminThemeProvider>
  );
};

export default AdminLayout;
