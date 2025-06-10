import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
// import { consumerApi, type LikedManagerResponseDto, type BlackListedManagerResponseDto } from '@/apis/consumer';
import type { LikedManagerResponseDto, BlackListedManagerResponseDto } from '@/apis/consumer';

// 테스트용 목 데이터
const mockFavoriteManagers = [
  {
    managerUuid: 'test-1',
    name: '김도우미',
    profileImage: undefined,
    averageRate: 4.8,
    reviewCount: 128,
    region: ['청소', '요리'],
    introduceText: '안녕하세요, 5년 경력의 전문 도우미입니다.'
  },
  {
    managerUuid: 'test-2',
    name: '이도우미',
    profileImage: undefined,
    averageRate: 4.9,
    reviewCount: 256,
    region: ['빨래', '청소'],
    introduceText: '신속하고 정확한 서비스 제공을 약속드립니다.'
  },
];

const mockBlacklist = [
  {
    managerUuid: 'test-3',
    name: '박도우미',
    profileImage: undefined,
    averageRate: 3.2,
    reviewCount: 45,
    region: ['요리'],
    introduceText: '서비스 품질이 좋지 않았습니다.'
  },
];

export default function ManagerList() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteManagers, setFavoriteManagers] = useState<LikedManagerResponseDto[]>(mockFavoriteManagers);
  const [blacklistManagers, setBlacklistManagers] = useState<BlackListedManagerResponseDto[]>(mockBlacklist);

  // URL에 따라 데이터 로드
  useEffect(() => {
    // API 호출 주석 처리
    /*
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
    */
  }, [location.pathname]);

  // 찜한 매니저 삭제
  const handleRemoveFavorite = async (managerUuid: string) => {
    // API 호출 주석 처리
    /*
    try {
      await consumerApi.removeLikedManager(managerUuid);
      setFavoriteManagers(prev => prev.filter(m => m.managerUuid !== managerUuid));
      showToast('찜한 매니저에서 삭제되었습니다.', 'success');
    } catch (error) {
      showToast('매니저 삭제에 실패했습니다.', 'error');
    }
    */
    setFavoriteManagers(prev => prev.filter(m => m.managerUuid !== managerUuid));
    showToast('찜한 매니저에서 삭제되었습니다.', 'success');
  };

  // 블랙리스트 매니저 삭제
  const handleRemoveBlacklist = async (managerUuid: string) => {
    // API 호출 주석 처리
    /*
    try {
      await consumerApi.createPreference(managerUuid, { preference: true });
      setBlacklistManagers(prev => prev.filter(m => m.managerUuid !== managerUuid));
      showToast('블랙리스트에서 삭제되었습니다.', 'success');
    } catch (error) {
      showToast('매니저 삭제에 실패했습니다.', 'error');
    }
    */
    setBlacklistManagers(prev => prev.filter(m => m.managerUuid !== managerUuid));
    showToast('블랙리스트에서 삭제되었습니다.', 'success');
  };

  // 탭 전환
  const handleTabChange = (tab: 'favorites' | 'blacklist') => {
    navigate(tab === 'favorites' ? '/consumers/likes' : '/consumers/blacklist');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">로딩중...</div>;
  }

  const isBlacklist = location.pathname.includes('blacklist');

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg ${
            !isBlacklist
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => handleTabChange('favorites')}
        >
          찜한 매니저
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            isBlacklist
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700'
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
  );
} 