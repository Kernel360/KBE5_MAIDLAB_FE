import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { consumerApi, type LikedManagerResponseDto, type BlackListedManagerResponseDto } from '@/apis/consumer';
import { ROUTES } from '@/constants/route';

export default function ManagerList() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteManagers, setFavoriteManagers] = useState<LikedManagerResponseDto[]>([]);
  const [blacklistManagers, setBlacklistManagers] = useState<BlackListedManagerResponseDto[]>([]);

  // URL에 따라 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (location.pathname.includes('blacklist')) {
          const data = await consumerApi.getBlackListManagers();
          setBlacklistManagers(data);
        } else {
          const data = await consumerApi.getLikedManagers();
          setFavoriteManagers(data);
        }
      } catch (error) {
        showToast('매니저 목록을 불러오는데 실패했습니다.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [location.pathname, showToast]);

  // 찜한 매니저 삭제
  const handleRemoveFavorite = async (managerUuid: string) => {
    try {
      await consumerApi.removeLikedManager(managerUuid);
      setFavoriteManagers(prev => prev.filter(m => m.managerUuid !== managerUuid));
      showToast('찜한 매니저에서 삭제되었습니다.', 'success');
    } catch (error) {
      showToast('매니저 삭제에 실패했습니다.', 'error');
    }
  };

  // 블랙리스트 매니저 삭제
  const handleRemoveBlacklist = async (managerUuid: string) => {
    try {
      await consumerApi.createPreference(managerUuid, { preference: true });
      setBlacklistManagers(prev => prev.filter(m => m.managerUuid !== managerUuid));
      showToast('블랙리스트에서 삭제되었습니다.', 'success');
    } catch (error) {
      showToast('매니저 삭제에 실패했습니다.', 'error');
    }
  };

  // 탭 전환
  const handleTabChange = (tab: 'favorites' | 'blacklist') => {
    navigate(tab === 'favorites' ? ROUTES.CONSUMER.LIKED_MANAGERS : ROUTES.CONSUMER.BLACKLIST);
  };

  const handleBack = () => {
    navigate(ROUTES.CONSUMER.MYPAGE);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">로딩중...</div>;
  }

  const isBlacklist = location.pathname.includes('blacklist');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow">
        <div className="flex items-center justify-between px-4 h-14">
          <button 
            onClick={handleBack}
            className="p-2 -ml-2 hover:text-[#F97316] transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-lg font-semibold">
            {isBlacklist ? '블랙리스트 도우미' : '찜한 도우미'}
          </h1>
          {/* 빈 div로 균형 맞추기 */}
          <div className="w-10"></div>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="pt-14 pb-4">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex w-full mb-6">
            <button
              className={`flex-1 py-2 rounded-l-lg transition-colors border-b-2 ${
                !isBlacklist
                  ? 'bg-white text-[#F97316] border-[#F97316]'
                  : 'bg-white text-gray-600 border-transparent hover:text-[#F97316]'
              }`}
              onClick={() => handleTabChange('favorites')}
            >
              찜한 매니저
            </button>
            <button
              className={`flex-1 py-2 rounded-r-lg transition-colors border-b-2 ${
                isBlacklist
                  ? 'bg-white text-[#F97316] border-[#F97316]'
                  : 'bg-white text-gray-600 border-transparent hover:text-[#F97316]'
              }`}
              onClick={() => handleTabChange('blacklist')}
            >
              블랙리스트
            </button>
          </div>

          <div className="space-y-4">
            {!isBlacklist ? (
              favoriteManagers.length > 0 ? (
                favoriteManagers.map((manager) => (
                  <div
                    key={manager.managerUuid}
                    className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={manager.profileImage || '/default-profile.png'}
                        alt={manager.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold">{manager.name}</h3>
                        <p className="text-gray-600">
                          평점: {manager.averageRate.toFixed(1)}
                        </p>
                        {manager.introduceText && (
                          <p className="text-gray-500 mt-1">{manager.introduceText}</p>
                        )}
                        {manager.region && manager.region.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {manager.region.map((region) => (
                              <span
                                key={region}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded"
                              >
                                {region}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFavorite(manager.managerUuid)}
                      className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      삭제
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  찜한 매니저가 없습니다.
                </div>
              )
            ) : blacklistManagers.length > 0 ? (
              blacklistManagers.map((manager) => (
                <div
                  key={manager.managerUuid}
                  className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={manager.profileImage || '/default-profile.png'}
                      alt={manager.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold">{manager.name}</h3>
                      <p className="text-gray-600">
                        평점: {manager.averageRate.toFixed(1)}
                      </p>
                      {manager.introduceText && (
                        <p className="text-gray-500 mt-1">{manager.introduceText}</p>
                      )}
                      {manager.region && manager.region.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {manager.region.map((region) => (
                            <span
                              key={region}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded"
                            >
                              {region}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveBlacklist(manager.managerUuid)}
                    className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    삭제
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                블랙리스트 매니저가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 