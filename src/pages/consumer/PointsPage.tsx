import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header/Header';
import { ROUTES } from '@/constants';
import { Coins } from 'lucide-react';
import { usePoint } from '@/hooks/domain/usePoint';

const PAGE_SIZE = 5;

const PointsPage: React.FC = () => {
  const { point, history, hasNext, loading, error, fetchPoint, fetchPointHistory } = usePoint();
  const [monthOffset, setMonthOffset] = useState(0);
  const [page, setPage] = useState(0);
  const [allLoaded, setAllLoaded] = useState(false);
  const [list, setList] = useState<typeof history>([]);

  // 현재 월 계산
  const getMonthLabel = (offset: number) => {
    const now = new Date();
    now.setMonth(now.getMonth() + offset);
    return `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
  };

  // 월이 바뀌면 페이지/리스트 초기화
  useEffect(() => {
    setPage(0);
    setList([]);
    setAllLoaded(false);
  }, [monthOffset]);

  // 포인트 조회(최초 1회)
  useEffect(() => {
    fetchPoint();
  }, [fetchPoint]);

  // 페이지/월 변경 시 내역 불러오기
  useEffect(() => {
    fetchPointHistory({
      monthOffset,
      pointType: 'ALL',
      pageable: {
        page,
        size: PAGE_SIZE,
        sort: [
          { property: 'createdAt', direction: 'DESC' },
        ],
      },
    });
  }, [monthOffset, page, fetchPointHistory]);

  // history가 바뀔 때 리스트 누적/마지막 페이지 체크
  useEffect(() => {
    if (page === 0) {
      setList(history);
    } else if (history.length > 0) {
      setList((prev) => [...prev, ...history]);
    }
    // hasNext로 마지막 페이지 판단
    setAllLoaded(!hasNext);
  }, [history, page, hasNext]);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  // 월 변경 핸들러 (1년 범위 제한)
  const handlePrevMonth = () => {
    if (monthOffset > -11) setMonthOffset((prev) => prev - 1);
  };
  const handleNextMonth = () => {
    if (monthOffset < 0) setMonthOffset((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        variant="sub"
        title="내 포인트"
        backRoute={ROUTES.CONSUMER.MYPAGE}
        showMenu={false}
      />
      <div className="px-4 pb-6 max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 text-center">
          <div className="flex flex-col items-center gap-2 mb-4">
            <Coins className="w-10 h-10 text-[#FF6B00]" />
            <span className="text-gray-600">내 포인트</span>
            <span className="text-2xl font-bold text-[#FF6B00]">{point !== null ? point.toLocaleString() : '-'}P</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            {/* 이전달 버튼 */}
            <button
              className={`px-2 py-1 min-w-[40px] rounded-md text-lg font-medium transition-colors
                ${monthOffset <= -11 ? 'text-gray-300 bg-transparent border-none' : 'text-[#FF6B00] border-transparent bg-white hover:bg-orange-50 border'}
              `}
              onClick={handlePrevMonth}
              disabled={monthOffset <= -11}
              aria-label="이전달"
            >
              ◀
            </button>
            <span className="font-semibold text-gray-800">{getMonthLabel(monthOffset)}</span>
            {/* 다음달 버튼 */}
            <button
              className={`px-2 py-1 min-w-[40px] rounded-md text-lg font-medium transition-colors
                ${monthOffset >= 0 ? 'text-gray-300 bg-transparent border-none' : 'text-[#FF6B00] border-transparent bg-white hover:bg-orange-50 border'}
              `}
              onClick={handleNextMonth}
              disabled={monthOffset >= 0}
              aria-label="다음달"
            >
              ▶
            </button>
          </div>
          <h3 className="text-lg font-semibold mb-4">포인트 내역</h3>
          {loading && page === 0 ? (
            <div className="text-gray-400 text-center py-8">로딩 중...</div>
          ) : error ? (
            <div className="text-red-400 text-center py-8">{error}</div>
          ) : list.length === 0 ? (
            <div className="text-gray-400 text-center py-8">해당 월의 포인트 내역이 없습니다.</div>
          ) : (
            <>
              <ul className="divide-y divide-gray-100">
                {list.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center py-3">
                    <div>
                      <div className="text-gray-900 font-medium">{item.description}</div>
                      <div className="text-xs text-gray-400">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</div>
                    </div>
                    <div className={item.amount > 0 ? 'text-[#FF6B00] font-bold' : 'text-gray-400 font-bold'}>
                      {item.amount > 0 ? `+${item.amount.toLocaleString()}` : item.amount.toLocaleString()}P
                    </div>
                  </li>
                ))}
              </ul>
              {!allLoaded && (
                <button
                  className="w-full mt-4 py-2 bg-[#FF6B00] rounded text-white font-semibold hover:bg-[#FF8533] transition-colors"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? '불러오는 중...' : '더보기'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PointsPage; 