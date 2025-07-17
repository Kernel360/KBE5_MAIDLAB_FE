import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
  maxVisiblePages = 5,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages && !loading) {
      onPageChange(page);
      
      // 페이지 변경 후 스크롤을 맨 위로 이동
      const mainContainer = document.querySelector('.main-container');
      if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // 페이지 번호 계산
  let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

  // 끝 페이지가 조정되면 시작 페이지도 다시 계산
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(0, endPage - maxVisiblePages + 1);
  }

  const pages = [];

  // 첫 페이지 표시 (현재 범위에 포함되지 않은 경우)
  if (startPage > 0) {
    pages.push(
      <button
        key={0}
        onClick={() => handlePageChange(0)}
        disabled={loading}
        className="w-10 h-10 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-500"
      >
        1
      </button>
    );

    if (startPage > 1) {
      pages.push(
        <span
          key="start-ellipsis"
          className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm"
        >
          ...
        </span>
      );
    }
  }

  // 중간 페이지들
  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <button
        key={i}
        onClick={() => handlePageChange(i)}
        disabled={loading}
        className={`
          w-10 h-10 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50
          ${
            currentPage === i
              ? 'bg-orange-500 text-white shadow-md scale-110'
              : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-500 hover:scale-105'
          }
        `}
      >
        {i + 1}
      </button>
    );
  }

  // 마지막 페이지 표시 (현재 범위에 포함되지 않은 경우)
  if (endPage < totalPages - 1) {
    if (endPage < totalPages - 2) {
      pages.push(
        <span
          key="end-ellipsis"
          className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm"
        >
          ...
        </span>
      );
    }

    pages.push(
      <button
        key={totalPages - 1}
        onClick={() => handlePageChange(totalPages - 1)}
        disabled={loading}
        className="w-10 h-10 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-500"
      >
        {totalPages}
      </button>
    );
  }

  return (
    <div className={`flex justify-center items-center mt-8 gap-2 ${className}`}>
      {/* 이전 페이지 버튼 */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={loading || currentPage === 0}
        className="w-10 h-10 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-30 bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-500 disabled:hover:bg-white disabled:hover:text-gray-600"
      >
        ‹
      </button>

      {/* 페이지 번호들 */}
      {pages}

      {/* 다음 페이지 버튼 */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={loading || currentPage >= totalPages - 1}
        className="w-10 h-10 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-30 bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-500 disabled:hover:bg-white disabled:hover:text-gray-600"
      >
        ›
      </button>
    </div>
  );
};

export default Pagination;