import { useState, useEffect } from 'react';
import { useAdmin } from '@/hooks';
import type { AdminSettlement } from '@/types/domain/admin';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/utils';
import { getServiceTypeName } from '@/constants/admin';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, Eye } from 'lucide-react';

const SettlementList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    return startOfWeek.toISOString().split('T')[0];
  });
  const [settlements, setSettlements] = useState<AdminSettlement[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDateChanging, setIsDateChanging] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const { reservationManagement } = useAdmin();
  const navigate = useNavigate();

  const fetchSettlements = async (isDateChange = false) => {
    if (isDateChange) {
      setIsDateChanging(true);
    } else {
      setLoading(true);
    }
    
    try {
      const data = await reservationManagement.fetchWeeklySettlements(
        startDate,
        { page, size: rowsPerPage },
      );
      if (data) {
        setSettlements(data.settlements.content);
        setTotalAmount(data.totalAmount);
        setTotalElements(data.settlements.totalElements);
      }
    } finally {
      setLoading(false);
      setIsDateChanging(false);
    }
  };

  useEffect(() => {
    const isDateChange = page === 0; // 페이지가 0이면 날짜 변경으로 간주
    fetchSettlements(isDateChange);
  }, [page, rowsPerPage, startDate]);

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const getStatusChipStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border border-amber-200 shadow-sm';
      case 'failed':
        return 'bg-red-100 text-red-700 border border-red-200 shadow-sm';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200 shadow-sm';
    }
  };

  const handleViewDetail = (settlementId: number) => {
    navigate(`/admin/settlements/${settlementId}`);
  };

  // 이전/다음 일요일을 찾는 함수
  const findPreviousSunday = (dateStr: string) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  };

  const findNextSunday = (dateStr: string) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

  const handleDateNavigation = (direction: 'prev' | 'next') => {
    setIsDateChanging(true);
    const newDate = direction === 'prev' 
      ? findPreviousSunday(startDate)
      : findNextSunday(startDate);
    
    setStartDate(newDate);
    setPage(0); // 페이지 초기화
  };

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(totalElements / rowsPerPage);
  const startIndex = page * rowsPerPage + 1;
  const endIndex = Math.min((page + 1) * rowsPerPage, totalElements);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-500 rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">정산 데이터를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">정산 관리</h1>
          <p className="text-gray-600">주간별 정산 현황을 확인하고 관리하세요</p>
        </div>

        <div className="space-y-6">
          {/* 날짜 선택 카드 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-2" />
                  주간 시작 날짜 선택
                </label>
                <p className="text-xs text-gray-500">일요일 기준으로 주간을 표시합니다</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleDateNavigation('prev')}
                  disabled={isDateChanging}
                  className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="이전 주"
                >
                  {isDateChanging ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-500 rounded-full animate-spin"></div>
                  ) : (
                    <ChevronLeft className="w-5 h-5" />
                  )}
                </button>
                
                <div className="flex flex-col items-center min-w-[160px]">
                  <div className={`text-lg font-bold transition-opacity duration-200 ${isDateChanging ? 'opacity-50' : 'text-gray-900'}`}>
                    {formatDateForDisplay(startDate)}
                  </div>
                  <div className="text-sm text-gray-500">
                    일요일
                  </div>
                </div>
                
                <button
                  onClick={() => handleDateNavigation('next')}
                  disabled={isDateChanging}
                  className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="다음 주"
                >
                  {isDateChanging ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-500 rounded-full animate-spin"></div>
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 총 정산 금액 카드 */}
          <div className="bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 text-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-6 h-6 mr-3" />
                  <h2 className="text-xl font-bold">이번 주 총 정산 금액</h2>
                </div>
                <p className="text-4xl font-bold mb-2">{formatPrice(totalAmount)}</p>
                <p className="text-gray-100 text-sm">
                  📅 {formatDateForDisplay(startDate)} 주간
                </p>
              </div>
            </div>
          </div>

          {/* 테이블 카드 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">정산 내역</h3>
              <p className="text-sm text-gray-600 mt-1">총 {totalElements}건의 정산 내역</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">매니저</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">서비스 유형</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">상세 서비스</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">상태</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">금액</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">생성일</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {settlements.map((settlement, index) => (
                    <tr key={settlement.settlementId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-gray-600 font-semibold text-sm">
                              {settlement.managerName.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{settlement.managerName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                          {getServiceTypeName(settlement.serviceType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{settlement.serviceDetailType}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusChipStyles(settlement.status)}`}>
                          {settlement.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(settlement.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(settlement.createdAt)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetail(settlement.settlementId)}
                          className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          상세보기
                        </button>
                      </td>
                    </tr>
                  ))}
                  {settlements.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">정산 내역이 없습니다</p>
                          <p className="text-gray-400 text-sm">선택한 주간에는 정산 데이터가 없습니다</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label htmlFor="rows-per-page" className="text-sm font-medium text-gray-700">
                    페이지당 표시:
                  </label>
                  <select
                    id="rows-per-page"
                    value={rowsPerPage}
                    onChange={handleChangeRowsPerPage}
                    className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    disabled={totalElements === 0}
                  >
                    <option value={5}>5개</option>
                    <option value={10}>10개</option>
                    <option value={25}>25개</option>
                    <option value={50}>50개</option>
                  </select>
                </div>

                <div className="flex items-center space-x-6">
                  <span className="text-sm text-gray-700 font-medium">
                    {totalElements === 0 ? '0-0 / 0' : `${startIndex}-${endIndex} / ${totalElements}`}
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleChangePage(0)}
                      disabled={page === 0 || totalElements === 0}
                      className="p-2 text-gray-400 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ≪
                    </button>
                    <button
                      onClick={() => handleChangePage(page - 1)}
                      disabled={page === 0 || totalElements === 0}
                      className="p-2 text-gray-400 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ‹
                    </button>
                    
                    {/* 페이지 번호 표시 */}
                    <div className="flex items-center space-x-1 mx-4">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i;
                        } else if (page < 3) {
                          pageNum = i;
                        } else if (page > totalPages - 4) {
                          pageNum = totalPages - 5 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handleChangePage(pageNum)}
                            className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                              page === pageNum
                                ? 'bg-orange-500 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum + 1}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => handleChangePage(page + 1)}
                      disabled={page >= totalPages - 1 || totalElements === 0}
                      className="p-2 text-gray-400 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ›
                    </button>
                    <button
                      onClick={() => handleChangePage(totalPages - 1)}
                      disabled={page >= totalPages - 1 || totalElements === 0}
                      className="p-2 text-gray-400 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ≫
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettlementList;