import {
  SEOUL_DISTRICT_LABELS,
  SEOUL_DISTRICT_IDS,
  SEOUL_DISTRICTS,
  type SeoulDistrict,
} from '@/constants/region';

/**
 * 주소에서 서울 구 이름을 추출하여 지역 ID를 반환
 * @param address 전체 주소 문자열
 * @returns 지역 ID (숫자) 또는 null (찾을 수 없는 경우)
 */
export const extractRegionIdFromAddress = (address: string): number | null => {
  if (!address) return null;

  // 서울 구 이름들을 검색
  for (const [districtCode, districtName] of Object.entries(SEOUL_DISTRICT_LABELS)) {
    if (address.includes(districtName)) {
      const regionId = SEOUL_DISTRICT_IDS[districtCode as SeoulDistrict];
      return regionId;
    }
  }

  return null;
};

/**
 * 주소에서 서울 구 이름을 추출
 * @param address 전체 주소 문자열
 * @returns 구 이름 또는 null
 */
export const extractDistrictFromAddress = (address: string): string | null => {
  if (!address) return null;

  for (const districtName of Object.values(SEOUL_DISTRICT_LABELS)) {
    if (address.includes(districtName)) {
      return districtName;
    }
  }

  return null;
};

/**
 * 매니저 지역 배열에서 첫 번째 지역의 ID를 반환
 * @param managerRegions 매니저 지역 배열 (예: ["강남구", "서초구"])
 * @returns 지역 ID 또는 null
 */
export const getRegionIdFromManagerRegions = (managerRegions: string[]): number | null => {
  if (!managerRegions || managerRegions.length === 0) return null;

  // 첫 번째 지역의 ID를 반환
  const firstRegion = managerRegions[0];
  return extractRegionIdFromAddress(firstRegion);
};