import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { consumerApi } from '@/apis/consumer';
import type {
  LikedManagerResponse,
  BlackListedManagerResponse,
} from '@/types/consumer';
import { ROUTES } from '@/constants/route';
import styled from 'styled-components';
import { ArrowLeft, Star } from 'lucide-react';

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
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid white;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
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
  font-size: 1.25rem;
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
  flex-direction: column;
  align-items: stretch;
  padding: 1.5rem;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f5f9;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
    border-color: #e2e8f0;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #f97316, #fb923c);
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const ManagerInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex: 1;
  min-width: 0;
`;

const ManagerDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
`;

const ManagerHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ManagerName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.4;
`;

const RatingBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 1rem;
  border: 1px solid #fbbf24;
  white-space: nowrap;
`;

const IntroduceText = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 500;
  background: none;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 60px;

  &:hover {
    background-color: #fef2f2;
    color: #dc2626;
    border-color: #fca5a5;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const RegionContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.25rem;
`;

const RegionTag = styled.span`
  padding: 0.25rem 0.625rem;
  background-color: #f8fafc;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f1f5f9;
    border-color: #cbd5e1;
  }
`;

const ExpandButton = styled.button`
  padding: 0.25rem 0.5rem;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s ease;
  border-radius: 0.375rem;

  &:hover {
    color: #475569;
    background-color: #f1f5f9;
  }
`;

const ExpandIcon = styled.span<{ $isExpanded: boolean }>`
  display: inline-block;
  transition: transform 0.2s ease;
  transform: rotate(${(props) => (props.$isExpanded ? '180deg' : '0deg')});
  font-size: 0.625rem;
`;

export default function ManagerList() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteManagers, setFavoriteManagers] = useState<
    LikedManagerResponse[]
  >([]);
  const [blacklistManagers, setBlacklistManagers] = useState<
    BlackListedManagerResponse[]
  >([]);
  const [imageLoadErrors, setImageLoadErrors] = useState<
    Record<string, boolean>
  >({});
  const [expandedRegions, setExpandedRegions] = useState<
    Record<string, boolean>
  >({});

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
      setFavoriteManagers((prev) =>
        prev.filter((m) => m.managerUuid !== managerUuid),
      );
      showToast('찜한 매니저에서 삭제되었습니다.', 'success');
    } catch (error) {
      showToast('매니저 삭제에 실패했습니다.', 'error');
    }

    setFavoriteManagers((prev) =>
      prev.filter((m) => m.managerUuid !== managerUuid),
    );
    showToast('찜한 매니저에서 삭제되었습니다.', 'success');
  };

  // 블랙리스트 매니저 삭제
  const handleRemoveBlacklist = async (managerUuid: string) => {
    try {
      await consumerApi.removeLikedManager(managerUuid);
      setBlacklistManagers((prev) =>
        prev.filter((m) => m.managerUuid !== managerUuid),
      );
      showToast('블랙리스트에서 삭제되었습니다.', 'success');
    } catch (error) {
      showToast('매니저 삭제에 실패했습니다.', 'error');
    }
    setBlacklistManagers((prev) =>
      prev.filter((m) => m.managerUuid !== managerUuid),
    );
    showToast('블랙리스트에서 삭제되었습니다.', 'success');
  };

  // 탭 전환
  const handleTabChange = (tab: 'favorites' | 'blacklist') => {
    navigate(
      tab === 'favorites'
        ? ROUTES.CONSUMER.LIKED_MANAGERS
        : ROUTES.CONSUMER.BLACKLIST,
    );
  };

  const handleBack = () => {
    navigate(ROUTES.CONSUMER.MYPAGE);
  };

  const handleImageError = (managerUuid: string) => {
    setImageLoadErrors((prev) => ({
      ...prev,
      [managerUuid]: true,
    }));
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
      <RegionContainer>
        {displayRegions.map((region) => (
          <RegionTag key={region}>{region}</RegionTag>
        ))}
        {hasMore && (
          <ExpandButton onClick={() => toggleRegions(managerUuid)}>
            {isExpanded ? '접기' : `+${regions.length - 3}개 더보기`}
            <ExpandIcon $isExpanded={isExpanded}>▼</ExpandIcon>
          </ExpandButton>
        )}
      </RegionContainer>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">로딩중...</div>
    );
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
                favoriteManagers.map((manager) => {
                  const isExpanded = expandedRegions[manager.managerUuid];
                  return (
                    <ManagerCard
                      key={manager.managerUuid}
                      style={{
                        flexDirection: 'column',
                        alignItems: 'stretch',
                      }}
                    >
                      {/* 상단: 사진, 이름/평점/내용, 삭제 버튼 */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '1rem',
                        }}
                      >
                        {/* 1. 사진 섹션 */}
                        <ProfileImageContainer>
                          <ProfileImageWrapper>
                            {manager.profileImage &&
                            !imageLoadErrors[manager.managerUuid] ? (
                              <ProfileImage
                                src={manager.profileImage}
                                alt={`${manager.name}의 프로필`}
                                onError={() =>
                                  handleImageError(manager.managerUuid)
                                }
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

                        {/* 2. 이름, 평점, 내용 섹션 */}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            flex: 1,
                            gap: '0.5rem',
                            paddingLeft: '1rem',
                            paddingRight: '1rem',
                            alignItems: 'flex-start',
                            height: '80px',
                            justifyContent: 'center',
                          }}
                        >
                          <ManagerName
                            style={{
                              textAlign: 'left',
                              width: '100%',
                              paddingLeft: '5px',
                              fontSize: '1rem',
                            }}
                          >
                            {manager.name}
                          </ManagerName>
                          <RatingBadge
                            style={{
                              width: 'fit-content',
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.7rem',
                            }}
                          >
                            <Star className="w-3 h-3" />
                            <span>{manager.averageRate.toFixed(1)}</span>
                          </RatingBadge>
                          {manager.introduceText && (
                            <IntroduceText
                              style={{
                                textAlign: 'left',
                                width: '100%',
                                paddingLeft: '10px',
                                fontSize: '0.75rem',
                                lineHeight: '1.3',
                              }}
                            >
                              {manager.introduceText}
                            </IntroduceText>
                          )}
                        </div>

                        {/* 3. 삭제 버튼 섹션 */}
                        <ActionButton
                          onClick={() =>
                            handleRemoveFavorite(manager.managerUuid)
                          }
                          style={{ alignSelf: 'center' }}
                        >
                          삭제
                        </ActionButton>
                      </div>

                      {/* 하단: 리전 영역 - 전체 너비 사용 */}
                      {manager.region && manager.region.length > 0 && (
                        <div
                          style={{
                            width: '100%',
                            paddingTop: '0.75rem',
                            borderTop: '1px solid #e2e8f0',
                          }}
                        >
                          {renderRegions(manager.region, manager.managerUuid)}
                        </div>
                      )}
                    </ManagerCard>
                  );
                })
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
              )
            ) : blacklistManagers.length > 0 ? (
              blacklistManagers.map((manager) => (
                <ManagerCard
                  key={manager.managerUuid}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* 1. 사진 섹션 */}
                  <ProfileImageContainer>
                    <ProfileImageWrapper>
                      {manager.profileImage &&
                      !imageLoadErrors[manager.managerUuid] ? (
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

                  {/* 2. 이름, 평점, 내용 섹션 */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                      gap: '0.5rem',
                      paddingLeft: '1rem',
                      paddingRight: '1rem',
                      alignItems: 'flex-start',
                      height: '80px',
                      justifyContent: 'center',
                    }}
                  >
                    <ManagerName
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        fontSize: '1rem',
                        paddingLeft: '3px',
                      }}
                    >
                      {manager.name}
                    </ManagerName>
                    <RatingBadge
                      style={{
                        width: 'fit-content',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.7rem',
                      }}
                    >
                      <Star className="w-3 h-3" />
                      <span>{manager.averageRate.toFixed(1)}</span>
                    </RatingBadge>
                    {manager.introduceText && (
                      <IntroduceText
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          lineHeight: '1.3',
                          paddingLeft: '5px',
                        }}
                      >
                        {manager.introduceText}
                      </IntroduceText>
                    )}
                    {manager.region && manager.region.length > 0 && (
                      <div style={{ marginTop: '0.5rem' }}>
                        {renderRegions(manager.region, manager.managerUuid)}
                      </div>
                    )}
                  </div>

                  {/* 3. 삭제 버튼 섹션 */}
                  <ActionButton
                    onClick={() => handleRemoveBlacklist(manager.managerUuid)}
                    style={{ alignSelf: 'center' }}
                  >
                    삭제
                  </ActionButton>
                </ManagerCard>
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
                  블랙리스트 매니저가 없습니다
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  블랙리스트에 추가된 도우미가 없습니다
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
