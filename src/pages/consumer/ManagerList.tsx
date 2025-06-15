import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { consumerApi, type LikedManagerResponseDto, type BlackListedManagerResponseDto } from '@/apis/consumer';
import { ROUTES } from '@/constants/route';
import styled from 'styled-components';

const ProfileImageContainer = styled.div`
  width: 80px;
  height: 80px;
  min-width: 80px;
  min-height: 80px;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  background: linear-gradient(to bottom right, #f3f4f6, #e5e7eb);
  border-radius: 50%;
`;

const ProfileInitial = styled.div`
  font-size: 1.5rem;
  font-weight: 500;
  color: #6b7280;
`;

const DeleteButton = styled.button`
  width: 80px;
  height: 36px;
  min-width: 80px;
  padding: 0.5rem 1rem;
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 22px;  /* (80px - 36px) / 2 = 22px to center vertically with profile image */

  &:hover {
    background-color: #fee2e2;
  }

  &:active {
    background-color: #fecaca;
  }
`;

const ManagerCard = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ManagerInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex: 1;
  min-width: 0;  /* Prevent flex item from overflowing */
`;

const RegionContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.25rem;
`;

const RegionTag = styled.span`
  padding: 0.25rem 0.5rem;
  background-color: #f3f4f6;
  color: #4b5563;
  font-size: 0.875rem;
  border-radius: 0.25rem;
`;

const ExpandButton = styled.button`
  padding: 0.25rem 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &:hover {
    color: #4b5563;
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
                        <h3 className="text-lg font-semibold text-left">{manager.name}</h3>
                        <p className="text-gray-600 text-left">
                          평점: {manager.averageRate.toFixed(1)}
                        </p>
                        {manager.introduceText && (
                          <p className="text-gray-500 mt-1 text-left">
                            {manager.introduceText.length > 15 
                              ? `${manager.introduceText.slice(0, 15)}...` 
                              : manager.introduceText}
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
                <div className="text-center py-8 text-gray-500">
                  찜한 매니저가 없습니다.
                </div>
              )
            ) : blacklistManagers.length > 0 ? (
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
                      <h3 className="text-lg font-semibold text-left">{manager.name}</h3>
                      <p className="text-gray-600 text-left">
                        평점: {manager.averageRate.toFixed(1)}
                      </p>
                      {manager.introduceText && (
                        <p className="text-gray-500 mt-1 text-left">
                          {manager.introduceText.length > 15 
                            ? `${manager.introduceText.slice(0, 15)}...` 
                            : manager.introduceText}
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