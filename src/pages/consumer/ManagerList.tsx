import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { consumerApi, type LikedManagerResponseDto, type BlackListedManagerResponseDto } from '@/apis/consumer';
import { ROUTES } from '@/constants/route';
import styled from 'styled-components';
import { ArrowLeft } from 'lucide-react';

const ProfileImageContainer = styled.div`
  width: 72px;
  height: 72px;
  min-width: 72px;
  min-height: 72px;
  position: relative;
  flex-shrink: 0;
`;

const ProfileImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #f3f4f6;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid white;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
`;

const ProfileFallback = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  border-radius: 50%;
`;

const ProfileInitial = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #6b7280;
`;

const DeleteButton = styled.button`
  padding: 0.5rem 1rem;
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;

  &:hover {
    color: #dc2626;
    text-decoration: underline;
  }

  &:active {
    color: #b91c1c;
  }
`;

const ManagerCard = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.25rem;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f3f4f6;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }
`;

const ManagerInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex: 1;
  min-width: 0;
`;

const RegionContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.5rem;
`;

const RegionTag = styled.span`
  padding: 0.25rem 0.625rem;
  background-color: #f3f4f6;
  color: #4b5563;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
`;

const ExpandButton = styled.button`
  padding: 0.25rem 0.5rem;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s;

  &:hover {
    color: #4b5563;
    background-color: #f3f4f6;
    border-radius: 0.375rem;
  }
`;

const ExpandIcon = styled.span<{ isExpanded: boolean }>`
  display: inline-block;
  transition: transform 0.2s;
  transform: rotate(${props => props.isExpanded ? '180deg' : '0deg'});
`;

export default function ManagerList() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteManagers, setFavoriteManagers] = useState<LikedManagerResponseDto[]>([]);
  const [blacklistManagers, setBlacklistManagers] = useState<BlackListedManagerResponseDto[]>([]);
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({});

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
      await consumerApi.removeLikedManager(managerUuid);
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

  const handleImageError = (managerUuid: string) => {
    setImageLoadErrors(prev => ({
      ...prev,
      [managerUuid]: true
    }));
  };

  const toggleRegions = (managerUuid: string) => {
    setExpandedRegions(prev => ({
      ...prev,
      [managerUuid]: !prev[managerUuid]
    }));
  };

  const renderRegions = (regions: string[], managerUuid: string) => {
    if (!regions || regions.length === 0) return null;

    const isExpanded = expandedRegions[managerUuid];
    const displayRegions = isExpanded ? regions : regions.slice(0, 3);
    const hasMore = regions.length > 3;

    return (
      <RegionContainer>
        {displayRegions.map((region) => (
          <RegionTag key={region}>
            {region}
          </RegionTag>
        ))}
        {hasMore && (
          <ExpandButton onClick={() => toggleRegions(managerUuid)}>
            {isExpanded ? '접기' : `+${regions.length - 3}개 더보기`}
            <ExpandIcon isExpanded={isExpanded}>▼</ExpandIcon>
          </ExpandButton>
        )}
      </RegionContainer>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">로딩중...</div>;
  }

  const isBlacklist = location.pathname.includes('blacklist');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-lg font-semibold">
            {isBlacklist ? '블랙리스트 도우미' : '찜한 도우미'}
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="pt-14 pb-4">
        <div className="max-w-2xl mx-auto px-4">
          {/* 탭 */}
          <div className="flex w-full mb-6 bg-white rounded-xl p-1 shadow-sm">
            <button
              className={`flex-1 py-2.5 rounded-lg transition-all ${
                !isBlacklist
                  ? 'bg-[#F97316] text-white font-medium shadow-sm'
                  : 'text-gray-600 hover:text-[#F97316]'
              }`}
              onClick={() => handleTabChange('favorites')}
            >
              찜한 매니저
            </button>
            <button
              className={`flex-1 py-2.5 rounded-lg transition-all ${
                isBlacklist
                  ? 'bg-[#F97316] text-white font-medium shadow-sm'
                  : 'text-gray-600 hover:text-[#F97316]'
              }`}
              onClick={() => handleTabChange('blacklist')}
            >
              블랙리스트
            </button>
          </div>

          {/* 매니저 목록 */}
          <div className="space-y-3">
            {!isBlacklist ? (
              favoriteManagers.length > 0 ? (
                favoriteManagers.map((manager) => (
                  <ManagerCard key={manager.managerUuid}>
                    <ManagerInfo>
                      <ProfileImageContainer>
                        <ProfileImageWrapper>
                          {manager.profileImage && !imageLoadErrors[manager.managerUuid] ? (
                            <ProfileImage
                              src={manager.profileImage}
                              alt={`${manager.name}의 프로필`}
                              onError={() => handleImageError(manager.managerUuid)}
                              loading="lazy"
                            />
                          ) : (
                            <ProfileFallback>
                              <ProfileInitial>
                                {manager.name.charAt(0)}
                              </ProfileInitial>
                            </ProfileFallback>
                          )}
                        </ProfileImageWrapper>
                      </ProfileImageContainer>
                      <div className="flex flex-col items-start pt-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{manager.name}</h3>
                          <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-xs font-medium rounded-full">
                            평점 {manager.averageRate.toFixed(1)}
                          </span>
                        </div>
                        {manager.introduceText && (
                          <p className="text-gray-600 mt-1 text-sm line-clamp-2">
                            {manager.introduceText}
                          </p>
                        )}
                        {manager.region && manager.region.length > 0 && (
                          renderRegions(manager.region, manager.managerUuid)
                        )}
                      </div>
                    </ManagerInfo>
                    <DeleteButton onClick={() => handleRemoveFavorite(manager.managerUuid)}>
                      삭제
                    </DeleteButton>
                  </ManagerCard>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">찜한 매니저가 없습니다</p>
                  <p className="text-gray-400 text-sm mt-1">마음에 드는 도우미를 찜해보세요</p>
                </div>
              )
            ) : (
              blacklistManagers.length > 0 ? (
                blacklistManagers.map((manager) => (
                  <ManagerCard key={manager.managerUuid}>
                    <ManagerInfo>
                      <ProfileImageContainer>
                        <ProfileImageWrapper>
                          {manager.profileImage && !imageLoadErrors[manager.managerUuid] ? (
                            <ProfileImage
                              src={manager.profileImage}
                              alt={`${manager.name}의 프로필`}
                              onError={() => handleImageError(manager.managerUuid)}
                              loading="lazy"
                            />
                          ) : (
                            <ProfileFallback>
                              <ProfileInitial>
                                {manager.name.charAt(0)}
                              </ProfileInitial>
                            </ProfileFallback>
                          )}
                        </ProfileImageWrapper>
                      </ProfileImageContainer>
                      <div className="flex flex-col items-start pt-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{manager.name}</h3>
                          <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-xs font-medium rounded-full">
                            평점 {manager.averageRate.toFixed(1)}
                          </span>
                        </div>
                        {manager.introduceText && (
                          <p className="text-gray-600 mt-1 text-sm line-clamp-2">
                            {manager.introduceText}
                          </p>
                        )}
                        {manager.region && manager.region.length > 0 && (
                          renderRegions(manager.region, manager.managerUuid)
                        )}
                      </div>
                    </ManagerInfo>
                    <DeleteButton onClick={() => handleRemoveBlacklist(manager.managerUuid)}>
                      삭제
                    </DeleteButton>
                  </ManagerCard>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">블랙리스트 매니저가 없습니다</p>
                  <p className="text-gray-400 text-sm mt-1">블랙리스트에 추가된 도우미가 없습니다</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 