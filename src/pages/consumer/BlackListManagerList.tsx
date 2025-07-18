import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/useToast';
import { consumerApi } from '@/apis/consumer';
import type { BlackListedManagerResponse } from '@/types/domain/consumer';
import { ROUTES } from '@/constants/route';
import { Star, Trash2 } from 'lucide-react';
import { SEOUL_DISTRICT_LABELS } from '@/constants/region';
import React from 'react';
import { usePagination } from '@/hooks';
import { Header } from '@/components/layout/Header/Header';
import Pagination from '@/components/common/Pagination';

function ManagerNameModal({
  name,
  introduceText,
  children,
}: {
  name: string;
  introduceText?: string;
  children: React.ReactNode;
}) {
  const nameRef = useRef<HTMLHeadingElement | null>(null);
  const [open, setOpen] = useState(false);
  const isNameTruncated = (el: HTMLHeadingElement | null) => {
    if (!el) return false;
    return el.scrollWidth > el.clientWidth;
  };
  const handleClick = () => {
    if (isNameTruncated(nameRef.current)) setOpen(true);
  };
  return (
    <>
      {React.cloneElement(children as React.ReactElement, {
        ref: nameRef,
        onClick: handleClick,
        className:
          (children as React.ReactElement).props.className +
          ' cursor-pointer hover:text-orange-600 transition-colors',
      })}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 min-w-[220px] max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-gray-900 dark:text-white">도우미 정보</span>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 text-xl"
              >
                &times;
              </button>
            </div>
            <div className="mb-2">
              <div className="font-semibold text-gray-800 dark:text-gray-200 break-words">
                {name}
              </div>
            </div>
            {introduceText && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 break-words">
                {introduceText}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function BlackListManagerList() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [blacklistManagers, setBlacklistManagers] = useState<
    BlackListedManagerResponse[]
  >([]);
  const [imageLoadErrors, setImageLoadErrors] = useState<
    Record<string, boolean>
  >({});
  const [expandedRegions, setExpandedRegions] = useState<
    Record<string, boolean>
  >({});

  const PAGE_SIZE = 5;
  const { currentPage, totalPages, startIndex, endIndex, goToPage } =
    usePagination({
      totalItems: blacklistManagers.length,
      itemsPerPage: PAGE_SIZE,
    });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await consumerApi.getBlackListManagers();
        setBlacklistManagers(data);
      } catch (error) {
        showToast('매니저 목록을 불러오는데 실패했습니다.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [showToast]);

  const handleRemoveBlacklist = async (managerUuid: string) => {
    try {
      await consumerApi.removePreferenceManager(managerUuid);
      setBlacklistManagers((prev) =>
        prev.filter((m) => m.managerUuid !== managerUuid),
      );
      showToast('블랙리스트에서 삭제되었습니다.', 'success');
    } catch (error) {
      showToast('매니저 삭제에 실패했습니다.', 'error');
    }
  };

  const handleImageError = (managerUuid: string) => {
    setImageLoadErrors((prev) => ({ ...prev, [managerUuid]: true }));
  };

  const toggleRegions = (managerUuid: string) => {
    setExpandedRegions((prev) => ({
      ...prev,
      [managerUuid]: !prev[managerUuid],
    }));
  };

  const renderRegions = (regions: string[], managerUuid: string) => {
    if (!regions || regions.length === 0) return null;
    const isExpanded = expandedRegions[managerUuid];
    const displayRegions = isExpanded ? regions : regions.slice(0, 3);
    const hasMore = regions.length > 3;
    return (
      <div className="flex flex-wrap gap-1.5">
        {displayRegions.map((region) => (
          <span key={region} className="region-tag">
            {SEOUL_DISTRICT_LABELS[
              region as keyof typeof SEOUL_DISTRICT_LABELS
            ] || region}
          </span>
        ))}
        {hasMore && (
          <button
            type="button"
            onClick={() => toggleRegions(managerUuid)}
            className="expand-btn"
          >
            {isExpanded ? '접기' : `+${regions.length - 3}개 더보기`}
            <span
              className={`inline-block transition-transform duration-200 text-[10px] ${isExpanded ? 'rotate-180' : ''}`}
            >
              ▼
            </span>
          </button>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-900 dark:text-white">로딩중...</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        variant="sub"
        title="블랙리스트 도우미"
        backRoute={ROUTES.CONSUMER.MYPAGE}
        showMenu={true}
      />
      <main className="px-4 py-6 pb-20">
        <div className="max-w-md mx-auto">
          <div className="space-y-3">
            {blacklistManagers.length > 0 ? (
              blacklistManagers.slice(startIndex, endIndex).map((manager) => (
                <div
                  key={manager.managerUuid}
                  className="relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-gray-700 transition-all duration-200 overflow-hidden group"
                >
                  {/* 상단: 프로필, 정보, 삭제 버튼 */}
                  <div className="flex items-start mb-4">
                    {/* 프로필 이미지 */}
                    <div className="w-20 h-20 min-w-[80px] min-h-[80px] relative flex-shrink-0">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 relative overflow-hidden">
                        {manager.profileImage &&
                        !imageLoadErrors[manager.managerUuid] ? (
                          <img
                            src={manager.profileImage}
                            alt={`${manager.name}의 프로필`}
                            className="w-full h-full object-cover rounded-full"
                            onError={() =>
                              handleImageError(manager.managerUuid)
                            }
                            loading="lazy"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 rounded-full">
                            <div className="text-xl font-semibold text-gray-500 dark:text-gray-400">
                              {manager.name.charAt(0)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* 매니저 정보 */}
                    <div className="flex-1 min-w-0 px-4 flex flex-col justify-center h-20">
                      <div className="flex items-center gap-2">
                        <ManagerNameModal
                          name={manager.name}
                          introduceText={manager.introduceText}
                        >
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate max-w-[120px] block">
                            {manager.name}
                          </h3>
                        </ManagerNameModal>
                        <div className="flex-shrink-0 inline-flex items-center gap-1 h-8 text-xs font-semibold rounded-full">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-yellow-800 text-base">
                            {manager.averageRate.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      {manager.introduceText && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 text-left mt-1">
                          {manager.introduceText}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-row items-center justify-center h-20 mr-2 gap-2">
                      <button
                        onClick={() =>
                          handleRemoveBlacklist(manager.managerUuid)
                        }
                        className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
                        style={{ border: 'none', padding: 0 }}
                        aria-label="삭제"
                      >
                        <Trash2 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </button>
                    </div>
                  </div>
                  {/* 하단: 지역 정보 */}
                  {manager.region && manager.region.length > 0 && (
                    <div className="pt-4 border-t border-slate-200 dark:border-gray-700">
                      {renderRegions(manager.region, manager.managerUuid)}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="text-gray-400 dark:text-gray-500 mb-2">
                  <svg
                    className="w-12 h-12 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  블랙리스트 매니저가 없습니다
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                  블랙리스트에 추가된 도우미가 없습니다
                </p>
              </div>
            )}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              loading={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
