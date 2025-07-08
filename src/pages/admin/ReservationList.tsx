import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { type ReservationListResponse } from '@/types/domain/reservation';
import { type MatchingResponse } from '@/types/domain/matching';
import { adminApi } from '../../apis/admin';
import { getServiceTypeName } from '@/constants/admin';
import MatchingChangeDialog from '../../components/features/admin/MatchingChangeDialog';
import type { TabPanelProps } from '@/types/common';

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <div className="py-6">{children}</div>}
    </div>
  );
}

const ReservationList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(() => {
    // 1. localStorage에서 값을 먼저 확인
    const savedTab = localStorage.getItem('adminReservationTab');
    if (savedTab !== null) {
      localStorage.removeItem('adminReservationTab');
      return parseInt(savedTab, 10);
    }
    // 2. location.state 확인
    return (location.state as { previousTab?: number })?.previousTab ?? 0;
  });
  const [reservations, setReservations] = useState<ReservationListResponse[]>(
    [],
  );
  const [matchings, setMatchings] = useState<MatchingResponse[]>([]);
  const [reservationPage, setReservationPage] = useState(0);
  const [matchingPage, setMatchingPage] = useState(0);
  const [reservationRowsPerPage, setReservationRowsPerPage] = useState(10);
  const [matchingRowsPerPage, setMatchingRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMatching, setSelectedMatching] =
    useState<MatchingResponse | null>(null);
  const [changingManager, setChangingManager] = useState(false);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const reservationsData = await adminApi.getReservations({
          page: reservationPage,
          size: reservationRowsPerPage,
        });
        setReservations(reservationsData);
      } catch (error) {
        console.error('예약 데이터를 불러오는데 실패했습니다:', error);
      } finally {
        setLoading(false);
      }
    };

    if (tabValue === 0) {
      fetchReservations();
    }
  }, [tabValue, reservationPage, reservationRowsPerPage]);

  useEffect(() => {
    const fetchMatchings = async () => {
      try {
        setLoading(true);
        const matchingsData = await adminApi.getAllMatching({
          page: matchingPage,
          size: matchingRowsPerPage,
        });
        setMatchings(matchingsData);
      } catch (error) {
        console.error('매칭 데이터를 불러오는데 실패했습니다:', error);
      } finally {
        setLoading(false);
      }
    };

    if (tabValue === 1) {
      fetchMatchings();
    }
  }, [tabValue, matchingPage, matchingRowsPerPage]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    handleCloseDialog();
  };

  const handleReservationChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setReservationRowsPerPage(parseInt(event.target.value, 10));
    setReservationPage(0);
  };

  const handleMatchingChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setMatchingRowsPerPage(parseInt(event.target.value, 10));
    setMatchingPage(0);
  };

  const formatDateTime = (date: string, time: string) => {
    return `${date} ${time}`;
  };

  const formatPrice = (price: number | string) => {
    const numericPrice =
      typeof price === 'string' ? parseInt(price, 10) : price;
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(numericPrice);
  };

  const getStatusChipColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'matched':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleOpenDialog = (matching: MatchingResponse) => {
    setSelectedMatching(matching);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMatching(null);
  };

  const handleConfirmChange = async (managerId: number) => {
    if (!selectedMatching) return;

    try {
      setChangingManager(true);

      // 매니저 변경 API 호출
      await adminApi.changeManager({
        reservationId: selectedMatching.reservationId,
        managerId: managerId,
      });

      // 성공 시 해당 매칭 항목만 업데이트 (전체 새로고침 대신)
      setMatchings((prevMatchings) =>
        prevMatchings.map((matching) =>
          matching.reservationId === selectedMatching.reservationId
            ? { ...matching, managerId: managerId }
            : matching,
        ),
      );

      handleCloseDialog();
    } catch (error) {
      console.error('매니저 변경 실패:', error);
      // TODO: 사용자에게 에러 메시지 표시 (토스트 등)
    } finally {
      setChangingManager(false);
    }
  };

  const handleDetailView = (reservationId: number) => {
    // 현재 탭 상태를 localStorage에 저장
    localStorage.setItem('adminReservationTab', tabValue.toString());
    navigate(`/admin/reservations/${reservationId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto mt-8 px-4">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">예약/매칭 관리</h1>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="예약/매칭 관리 탭">
          <button
            onClick={(e) => handleTabChange(e, 0)}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              tabValue === 0
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            예약 목록
          </button>
          <button
            onClick={(e) => handleTabChange(e, 1)}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              tabValue === 1
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            매칭 관리
          </button>
        </nav>
      </div>

      <TabPanel value={tabValue} index={0}>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    예약 ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    서비스 유형
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상세 서비스
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    예약 일시
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    금액
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservations.map((reservation) => (
                  <tr
                    key={reservation.reservationId}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.reservationId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getServiceTypeName(reservation.serviceType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.detailServiceType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(
                        reservation.reservationDate,
                        reservation.startTime,
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(reservation.totalPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() =>
                          handleDetailView(reservation.reservationId)
                        }
                        className="text-blue-600 hover:text-blue-900 px-3 py-1 text-sm border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                      >
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between items-center">
              <div className="flex items-center">
                <label
                  htmlFor="rows-per-page-reservations"
                  className="mr-2 text-sm text-gray-700"
                >
                  페이지당 행 수:
                </label>
                <select
                  id="rows-per-page-reservations"
                  value={reservationRowsPerPage}
                  onChange={handleReservationChangeRowsPerPage}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  Page {reservationPage + 1} - {reservations.length} items shown
                </span>
                <button
                  onClick={() => setReservationPage(reservationPage - 1)}
                  disabled={reservationPage === 0}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                <button
                  onClick={() => setReservationPage(reservationPage + 1)}
                  disabled={reservations.length < reservationRowsPerPage}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        </div>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    예약 ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    매니저 ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    매칭 상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    매칭 횟수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    업데이트 시간
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    매니저 변경
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {matchings.map((matching) => (
                  <tr key={matching.reservationId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {matching.reservationId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {matching.managerId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusChipColor(
                          matching.matchingStatus,
                        )}`}
                      >
                        {matching.matchingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {matching.matchingCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {matching.updatedAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        disabled={
                          matching.matchingStatus.toLowerCase() === 'pending'
                        }
                        onClick={() => handleOpenDialog(matching)}
                        className="text-blue-600 hover:text-blue-900 px-3 py-1 text-sm border border-blue-600 rounded hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                      >
                        매니저 변경
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between items-center">
              <div className="flex items-center">
                <label
                  htmlFor="rows-per-page-matchings"
                  className="mr-2 text-sm text-gray-700"
                >
                  페이지당 행 수:
                </label>
                <select
                  id="rows-per-page-matchings"
                  value={matchingRowsPerPage}
                  onChange={handleMatchingChangeRowsPerPage}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  Page {matchingPage + 1} - {matchings.length} items shown
                </span>
                <button
                  onClick={() => setMatchingPage(matchingPage - 1)}
                  disabled={matchingPage === 0}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                <button
                  onClick={() => setMatchingPage(matchingPage + 1)}
                  disabled={matchings.length < matchingRowsPerPage}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        </div>

        <MatchingChangeDialog
          open={openDialog}
          matching={selectedMatching}
          onClose={handleCloseDialog}
          onConfirm={handleConfirmChange}
          loading={changingManager}
        />
      </TabPanel>
    </div>
  );
};

export default ReservationList;
