import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// API 및 타입 import
import type {
  ManagerListResponse,
  ManagerListItem,
  AdminManagerDetail,
} from '@/types/domain/admin';
import { adminApi } from '../../apis/admin';
import {
  MANAGER_VERIFICATION_LABELS,
  MANAGER_VERIFICATION_STATUS,
  type ManagerVerificationStatus,
} from '../../constants/status';

import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NUMBER } from '@/constants/ui';
import { LOCAL_STORAGE_KEYS } from '@/constants/storage';
import { STATUS_FILTER_OPTIONS } from '@/constants/status';
import { USER_TYPES } from '@/constants/user';

import type { ManagerStatusFilter } from '@/types/domain/admin';

import { getLocalStorage, setLocalStorage } from '@/utils/storage';

const ManagerList = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(DEFAULT_PAGE_NUMBER);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ManagerStatusFilter>(
    () => {
      const savedStatus = getLocalStorage<ManagerStatusFilter>(
        LOCAL_STORAGE_KEYS.ADMIN_MANAGER_STATUS,
      );
      return savedStatus || 'ALL';
    },
  );

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const [managerData, setManagerData] = useState<ManagerListResponse>({
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

  const [managerDetails, setManagerDetails] = useState<
    Record<number, AdminManagerDetail>
  >({});

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(DEFAULT_PAGE_NUMBER);
  };

  const handleStatusChange = (event: any) => {
    const newStatus = event.target.value as ManagerStatusFilter;
    setSelectedStatus(newStatus);
    setLocalStorage(LOCAL_STORAGE_KEYS.ADMIN_MANAGER_STATUS, newStatus);
    setPage(DEFAULT_PAGE_NUMBER);
  };

  const handleSortClick = () => {
    if (selectedStatus !== MANAGER_VERIFICATION_STATUS.APPROVED) return;

    setSortOrder((prev) => {
      if (prev === 'asc') return 'desc';
      if (prev === 'desc') return null;
      return 'asc';
    });
  };

  const fetchManagers = async () => {
    try {
      setLoading(true);
      let response;

      if (selectedStatus === STATUS_FILTER_OPTIONS.ALL) {
        response = await adminApi.getManagers({
          page,
          size: rowsPerPage,
        });
        setManagerData(response);
      } else if (
        selectedStatus === STATUS_FILTER_OPTIONS.APPROVED &&
        sortOrder
      ) {
        const statusResponse = await adminApi.getManagersByStatus({
          page,
          size: rowsPerPage,
          status: selectedStatus,
          sortByRating: true,
          isDescending: sortOrder === 'desc',
        });
        response = statusResponse;
        setManagerData(response);
      } else {
        const statusResponse = await adminApi.getManagersByStatus({
          page,
          size: rowsPerPage,
          status: selectedStatus,
        });
        response = statusResponse;
        setManagerData(response);
      }

      const detailsPromises = response.content.map(
        async (manager: ManagerListItem) => {
          try {
            const details = await adminApi.getManager(manager.id);
            return { id: manager.id, details };
          } catch (error) {
            console.error(
              `Failed to fetch manager details for ID ${manager.id}:`,
              error,
            );
            return null;
          }
        },
      );

      const details = await Promise.all(detailsPromises);
      const detailsMap = details.reduce(
        (
          acc: Record<number, AdminManagerDetail>,
          curr: { id: number; details: AdminManagerDetail } | null,
        ) => {
          if (curr) {
            acc[curr.id] = curr.details;
          }
          return acc;
        },
        {} as Record<number, AdminManagerDetail>,
      );

      setManagerDetails(detailsMap);
    } catch (error) {
      console.error('Failed to fetch managers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, [page, rowsPerPage, selectedStatus, sortOrder]);

  const handleRowClick = (id: number) => {
    setLocalStorage(LOCAL_STORAGE_KEYS.ADMIN_MANAGER_STATUS, selectedStatus);
    navigate(`/admin/${USER_TYPES.MANAGER}/${id}`);
  };

  const renderManagerRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={4} className="px-6 py-4 text-center">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          </td>
        </tr>
      );
    }

    return managerData.content.map((manager) => {
      const details = managerDetails[manager.id];
      const verificationStatus =
        details?.isVerified as ManagerVerificationStatus;
      return (
        <tr
          key={manager.uuid}
          onClick={() => handleRowClick(manager.id)}
          className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        >
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {manager.id}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {manager.name}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {details?.averageRate ?? '-'}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                verificationStatus === MANAGER_VERIFICATION_STATUS.APPROVED
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {details
                ? MANAGER_VERIFICATION_LABELS[verificationStatus]
                : '불명'}
            </span>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="container mx-auto mt-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">매니저 관리</h1>

      <div className="flex gap-4 mb-6">
        <div className="min-w-[200px]">
          <label
            htmlFor="status-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            상태
          </label>
          <select
            id="status-filter"
            value={selectedStatus}
            onChange={handleStatusChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={STATUS_FILTER_OPTIONS.ALL}>전체</option>
            {Object.entries(MANAGER_VERIFICATION_STATUS).map(([, value]) => (
              <option key={value} value={value}>
                {
                  MANAGER_VERIFICATION_LABELS[
                    value as ManagerVerificationStatus
                  ]
                }
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
                <th
                  onClick={handleSortClick}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    selectedStatus === MANAGER_VERIFICATION_STATUS.APPROVED
                      ? 'cursor-pointer hover:bg-gray-100'
                      : 'cursor-default'
                  }`}
                >
                  평점{' '}
                  {selectedStatus === MANAGER_VERIFICATION_STATUS.APPROVED &&
                    (sortOrder === 'asc'
                      ? '▲'
                      : sortOrder === 'desc'
                        ? '▼'
                        : '')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  가입상태
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {renderManagerRows()}
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
                {Math.min((page + 1) * rowsPerPage, managerData.totalElements)}{' '}
                of {managerData.totalElements}
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
                disabled={page >= managerData.totalPages - 1}
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

export default ManagerList;
