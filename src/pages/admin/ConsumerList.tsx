import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// API 및 타입 import
import type { ConsumerListResponse } from '@/types/domain/admin';
import { adminApi } from '../../apis/admin';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NUMBER } from '../../constants/ui';
import { USER_TYPES } from '@/constants/user';
import {
  CONSUMER_FILTER_STATUS,
  CONSUMER_FILTER_LABELS,
  type ConsumerFilterStatus,
} from '../../constants/status';
import { LOCAL_STORAGE_KEYS } from '@/constants/storage';
import { getLocalStorage, setLocalStorage } from '@/utils/storage';

const ConsumerList = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(DEFAULT_PAGE_NUMBER);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<ConsumerFilterStatus>(
    () => {
      const savedFilter = getLocalStorage<ConsumerFilterStatus>(
        LOCAL_STORAGE_KEYS.ADMIN_CONSUMER_FILTER,
      );
      return savedFilter || 'ALL';
    },
  );

  const [consumerData, setConsumerData] = useState<ConsumerListResponse>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: DEFAULT_PAGE_SIZE,
    number: DEFAULT_PAGE_NUMBER,
    numberOfElements: 0,
    first: true,
    last: false,
    empty: true,
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(DEFAULT_PAGE_NUMBER);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilter = event.target.value as ConsumerFilterStatus;
    setSelectedFilter(newFilter);
    setLocalStorage(LOCAL_STORAGE_KEYS.ADMIN_CONSUMER_FILTER, newFilter);
    setPage(DEFAULT_PAGE_NUMBER);
  };

  const fetchConsumers = async () => {
    try {
      setLoading(true);
      let response;

      if (selectedFilter === CONSUMER_FILTER_STATUS.ALL) {
        response = await adminApi.getConsumers({
          page,
          size: rowsPerPage,
        });
      } else {
        const isDeleted = selectedFilter === CONSUMER_FILTER_STATUS.DELETED;
        response = await adminApi.getConsumersByFilter(isDeleted, {
          page,
          size: rowsPerPage,
        });
      }
      
      setConsumerData(response);
    } catch (error) {
      console.error('Failed to fetch consumers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsumers();
  }, [page, rowsPerPage, selectedFilter]);

  const handleRowClick = (id: number) => {
    navigate(`/admin/${USER_TYPES.CONSUMER}/${id}`);
  };

  const renderConsumerRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={3} className="px-6 py-4 text-center">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          </td>
        </tr>
      );
    }

    return consumerData.content.map((consumer) => (
      <tr
        key={consumer.id}
        onClick={() => handleRowClick(consumer.id)}
        className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
      >
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {consumer.id}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {consumer.name}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {consumer.phoneNumber}
        </td>
      </tr>
    ));
  };

  return (
    <div className="container mx-auto mt-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">수요자 관리</h1>

      <div className="flex gap-4 mb-6">
        <div className="min-w-[200px]">
          <label
            htmlFor="filter-select"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            계정 상태
          </label>
          <select
            id="filter-select"
            value={selectedFilter}
            onChange={handleFilterChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.entries(CONSUMER_FILTER_STATUS).map(([, value]) => (
              <option key={value} value={value}>
                {CONSUMER_FILTER_LABELS[value as ConsumerFilterStatus]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이름
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  전화번호
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {renderConsumerRows()}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between items-center">
            <div className="flex items-center">
              <label
                htmlFor="rows-per-page"
                className="mr-2 text-sm text-gray-700"
              >
                페이지당 행 수:
              </label>
              <select
                id="rows-per-page"
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                {page * rowsPerPage + 1}-
                {Math.min((page + 1) * rowsPerPage, consumerData.totalElements)}{' '}
                of {consumerData.totalElements}
              </span>
              <button
                onClick={() => handleChangePage(null, page - 1)}
                disabled={page === 0}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <button
                onClick={() => handleChangePage(null, page + 1)}
                disabled={page >= consumerData.totalPages - 1}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumerList;
