import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { consumerApi } from '@/apis/consumer';
import type { LikedManagerResponse } from '@/types/consumer';
import { ROUTES } from '@/constants/route';
import { ArrowLeft, Star, Trash2 } from 'lucide-react';
import { SEOUL_DISTRICT_LABELS } from '@/constants/region';

function ManagerNameModal({ name, introduceText }: { name: string, introduceText?: string }) {
  const nameRef = useRef<HTMLHeadingElement | null>(null);
  const [open, setOpen] = useState(false);
  const isNameTruncated = (el: HTMLHeadingElement | null) => {
    if (!el) return false;
    return el.scrollWidth > el.clientWidth;
  };
  return (
    <>
      <h3
        ref={nameRef}
        className="text-lg font-semibold text-gray-900 truncate max-w-[120px] block cursor-pointer hover:text-orange-600 transition-colors"
        onClick={() => {
          if (isNameTruncated(nameRef.current)) setOpen(true);
        }}
      >
        {name}
      </h3>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30" onClick={() => setOpen(false)}>
          <div
            className="bg-white rounded-xl shadow-lg p-6 min-w-[220px] max-w-xs"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-gray-900">도우미 정보</span>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="mb-2">
              <div className="font-semibold text-gray-800 break-words">{name}</div>
            </div>
            {introduceText && (
              <div className="text-sm text-gray-600 mt-2 break-words">{introduceText}</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function LikedManagerList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteManagers, setFavoriteManagers] = useState<LikedManagerResponse[]>([]);
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await consumerApi.getLikedManagers();
        setFavoriteManagers(data);
      } catch (error) {
        showToast('매니저 목록을 불러오는데 실패했습니다.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [showToast]);

  const handleRemoveFavorite = async (managerUuid: string) => {
    try {
      await consumerApi.removePreferenceManager(managerUuid);
      setFavoriteManagers((prev) => prev.filter((m) => m.managerUuid !== managerUuid));
      showToast('찜한 매니저에서 삭제되었습니다.', 'success');
    } catch (error) {
      showToast('매니저 삭제에 실패했습니다.', 'error');
    }
  };

  const handleBack = () => {
    navigate(ROUTES.CONSUMER.MYPAGE);
  };

  const handleImageError = (managerUuid: string) => {
    setImageLoadErrors((prev) => ({ ...prev, [managerUuid]: true }));
  };

  const toggleRegions = (managerUuid: string) => {
    setExpandedRegions((prev) => ({ ...prev, [managerUuid]: !prev[managerUuid] }));
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
            {SEOUL_DISTRICT_LABELS[region as keyof typeof SEOUL_DISTRICT_LABELS] || region}
          </span>
        ))}
        {hasMore && (
          <button type="button" onClick={() => toggleRegions(managerUuid)} className="expand-btn">
            {isExpanded ? '접기' : `+${regions.length - 3}개 더보기`}
            <span className={`inline-block transition-transform duration-200 text-[10px] ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
          </button>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">로딩중...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-lg font-semibold">찜한 도우미</h1>
          <div className="w-10" />
        </div>
      </div>
      {/* 컨텐츠 */}
      <div className="pt-20 pb-6">
        <div className="max-w-2xl mx-auto px-4">
          <div className="space-y-3">
            {favoriteManagers.length > 0 ? (
              favoriteManagers.map((manager) => (
                <div key={manager.managerUuid} className="relative bg-white rounded-xl p-6 shadow-sm border border-slate-200 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 overflow-hidden group">
                  {/* 상단 그라데이션 바 */}
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 to-orange-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  {/* 상단: 프로필, 정보, 삭제 버튼 */}
                  <div className="flex items-center mb-4">
                    {/* 프로필 이미지 */}
                    <div className="w-20 h-20 min-w-[80px] min-h-[80px] relative flex-shrink-0">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                        {manager.profileImage && !imageLoadErrors[manager.managerUuid] ? (
                          <img
                            src={manager.profileImage}
                            alt={`${manager.name}의 프로필`}
                            className="w-full h-full object-cover rounded-full"
                            onError={() => handleImageError(manager.managerUuid)}
                            loading="lazy"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-full">
                            <div className="text-xl font-semibold text-gray-500">
                              {manager.name.charAt(0)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* 매니저 정보 */}
                    <div className="flex-1 min-w-0 px-4 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1 min-w-0">
                        <ManagerNameModal name={manager.name} introduceText={manager.introduceText} />
                        <div className="flex-shrink-0 inline-flex items-center gap-1 h-8 text-xs font-semibold rounded-full">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-yellow-800 text-base">{manager.averageRate.toFixed(1)}</span>
                        </div>
                      </div>
                      {manager.introduceText && (
                        <p className="text-sm text-gray-500 line-clamp-2 text-left mt-1">
                          {manager.introduceText}
                        </p>
                      )}
                    </div>
                    {/* 삭제 버튼 */}
                    <button
                      onClick={() => handleRemoveFavorite(manager.managerUuid)}
                      className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors duration-200"
                      style={{ border: 'none', padding: 0 }}
                      aria-label="삭제"
                    >
                      <Trash2 className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                  {/* 하단: 지역 정보 */}
                  {manager.region && manager.region.length > 0 && (
                    <div className="pt-4 border-t border-slate-200">
                      {renderRegions(manager.region, manager.managerUuid)}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <div className="text-gray-400 mb-2">
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
                <p className="text-gray-500 font-medium">
                  찜한 매니저가 없습니다
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  마음에 드는 도우미를 찜해보세요
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 