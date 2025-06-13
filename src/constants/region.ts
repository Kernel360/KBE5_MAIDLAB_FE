// ===== 서울 지역 상수 =====
export const SEOUL_DISTRICTS = {
  GANGNAM: 'GANGNAM', // 강남구
  GANGDONG: 'GANGDONG', // 강동구
  GANGBUK: 'GANGBUK', // 강북구
  GANGSEO: 'GANGSEO', // 강서구
  GWANAK: 'GWANAK', // 관악구
  GWANGJIN: 'GWANGJIN', // 광진구
  GURO: 'GURO', // 구로구
  GEUMCHEON: 'GEUMCHEON', // 금천구
  NOWON: 'NOWON', // 노원구
  DOBONG: 'DOBONG', // 도봉구
  DONGDAEMUN: 'DONGDAEMUN', // 동대문구
  DONGJAK: 'DONGJAK', // 동작구
  MAPO: 'MAPO', // 마포구
  SEODAEMUN: 'SEODAEMUN', // 서대문구
  SEOCHO: 'SEOCHO', // 서초구
  SEONGDONG: 'SEONGDONG', // 성동구
  SEONGBUK: 'SEONGBUK', // 성북구
  SONGPA: 'SONGPA', // 송파구
  YANGCHEON: 'YANGCHEON', // 양천구
  YEONGDEUNGPO: 'YEONGDEUNGPO', // 영등포구
  YONGSAN: 'YONGSAN', // 용산구
  EUNPYEONG: 'EUNPYEONG', // 은평구
  JONGNO: 'JONGNO', // 종로구
  JUNG: 'JUNG', // 중구
  JUNGNANG: 'JUNGNANG', // 중랑구
} as const;

export type SeoulDistrict =
  (typeof SEOUL_DISTRICTS)[keyof typeof SEOUL_DISTRICTS];

// ===== 서울 지역 한글명 =====
export const SEOUL_DISTRICT_LABELS = {
  [SEOUL_DISTRICTS.GANGNAM]: '강남구',
  [SEOUL_DISTRICTS.GANGDONG]: '강동구',
  [SEOUL_DISTRICTS.GANGBUK]: '강북구',
  [SEOUL_DISTRICTS.GANGSEO]: '강서구',
  [SEOUL_DISTRICTS.GWANAK]: '관악구',
  [SEOUL_DISTRICTS.GWANGJIN]: '광진구',
  [SEOUL_DISTRICTS.GURO]: '구로구',
  [SEOUL_DISTRICTS.GEUMCHEON]: '금천구',
  [SEOUL_DISTRICTS.NOWON]: '노원구',
  [SEOUL_DISTRICTS.DOBONG]: '도봉구',
  [SEOUL_DISTRICTS.DONGDAEMUN]: '동대문구',
  [SEOUL_DISTRICTS.DONGJAK]: '동작구',
  [SEOUL_DISTRICTS.MAPO]: '마포구',
  [SEOUL_DISTRICTS.SEODAEMUN]: '서대문구',
  [SEOUL_DISTRICTS.SEOCHO]: '서초구',
  [SEOUL_DISTRICTS.SEONGDONG]: '성동구',
  [SEOUL_DISTRICTS.SEONGBUK]: '성북구',
  [SEOUL_DISTRICTS.SONGPA]: '송파구',
  [SEOUL_DISTRICTS.YANGCHEON]: '양천구',
  [SEOUL_DISTRICTS.YEONGDEUNGPO]: '영등포구',
  [SEOUL_DISTRICTS.YONGSAN]: '용산구',
  [SEOUL_DISTRICTS.EUNPYEONG]: '은평구',
  [SEOUL_DISTRICTS.JONGNO]: '종로구',
  [SEOUL_DISTRICTS.JUNG]: '중구',
  [SEOUL_DISTRICTS.JUNGNANG]: '중랑구',
} as const;

// ===== 서울 지역 DB ID 매핑 =====
export const SEOUL_DISTRICT_IDS = {
  [SEOUL_DISTRICTS.GANGNAM]: 1, // 강남구
  [SEOUL_DISTRICTS.GANGDONG]: 2, // 강동구
  [SEOUL_DISTRICTS.GANGBUK]: 3, // 강북구
  [SEOUL_DISTRICTS.GANGSEO]: 4, // 강서구
  [SEOUL_DISTRICTS.GWANAK]: 5, // 관악구
  [SEOUL_DISTRICTS.GWANGJIN]: 6, // 광진구
  [SEOUL_DISTRICTS.GURO]: 7, // 구로구
  [SEOUL_DISTRICTS.GEUMCHEON]: 8, // 금천구
  [SEOUL_DISTRICTS.NOWON]: 9, // 노원구
  [SEOUL_DISTRICTS.DOBONG]: 10, // 도봉구
  [SEOUL_DISTRICTS.DONGDAEMUN]: 11, // 동대문구
  [SEOUL_DISTRICTS.DONGJAK]: 12, // 동작구
  [SEOUL_DISTRICTS.MAPO]: 13, // 마포구
  [SEOUL_DISTRICTS.SEODAEMUN]: 14, // 서대문구
  [SEOUL_DISTRICTS.SEOCHO]: 15, // 서초구
  [SEOUL_DISTRICTS.SEONGDONG]: 16, // 성동구
  [SEOUL_DISTRICTS.SEONGBUK]: 17, // 성북구
  [SEOUL_DISTRICTS.SONGPA]: 18, // 송파구
  [SEOUL_DISTRICTS.YANGCHEON]: 19, // 양천구
  [SEOUL_DISTRICTS.YEONGDEUNGPO]: 20, // 영등포구
  [SEOUL_DISTRICTS.YONGSAN]: 21, // 용산구
  [SEOUL_DISTRICTS.EUNPYEONG]: 22, // 은평구
  [SEOUL_DISTRICTS.JONGNO]: 23, // 종로구
  [SEOUL_DISTRICTS.JUNG]: 24, // 중구
  [SEOUL_DISTRICTS.JUNGNANG]: 25, // 중랑구
} as const;

// 역방향 매핑 (ID -> 영문 코드)
export const DISTRICT_ID_TO_CODE: Record<number, SeoulDistrict> = {
  1: SEOUL_DISTRICTS.GANGNAM,
  2: SEOUL_DISTRICTS.GANGDONG,
  3: SEOUL_DISTRICTS.GANGBUK,
  4: SEOUL_DISTRICTS.GANGSEO,
  5: SEOUL_DISTRICTS.GWANAK,
  6: SEOUL_DISTRICTS.GWANGJIN,
  7: SEOUL_DISTRICTS.GURO,
  8: SEOUL_DISTRICTS.GEUMCHEON,
  9: SEOUL_DISTRICTS.NOWON,
  10: SEOUL_DISTRICTS.DOBONG,
  11: SEOUL_DISTRICTS.DONGDAEMUN,
  12: SEOUL_DISTRICTS.DONGJAK,
  13: SEOUL_DISTRICTS.MAPO,
  14: SEOUL_DISTRICTS.SEODAEMUN,
  15: SEOUL_DISTRICTS.SEOCHO,
  16: SEOUL_DISTRICTS.SEONGDONG,
  17: SEOUL_DISTRICTS.SEONGBUK,
  18: SEOUL_DISTRICTS.SONGPA,
  19: SEOUL_DISTRICTS.YANGCHEON,
  20: SEOUL_DISTRICTS.YEONGDEUNGPO,
  21: SEOUL_DISTRICTS.YONGSAN,
  22: SEOUL_DISTRICTS.EUNPYEONG,
  23: SEOUL_DISTRICTS.JONGNO,
  24: SEOUL_DISTRICTS.JUNG,
  25: SEOUL_DISTRICTS.JUNGNANG,
};

// ===== 지역별 그룹 (강남권, 강북권 등) =====
export const DISTRICT_GROUPS = {
  GANGNAM_AREA: {
    name: '강남권',
    districts: [
      SEOUL_DISTRICTS.GANGNAM,
      SEOUL_DISTRICTS.SEOCHO,
      SEOUL_DISTRICTS.SONGPA,
      SEOUL_DISTRICTS.GANGDONG,
    ],
  },
  GANGBUK_AREA: {
    name: '강북권',
    districts: [
      SEOUL_DISTRICTS.GANGBUK,
      SEOUL_DISTRICTS.DOBONG,
      SEOUL_DISTRICTS.NOWON,
      SEOUL_DISTRICTS.SEONGBUK,
    ],
  },
  GANGSERVER_AREA: {
    name: '강서권',
    districts: [
      SEOUL_DISTRICTS.GANGSEO,
      SEOUL_DISTRICTS.YANGCHEON,
      SEOUL_DISTRICTS.GURO,
      SEOUL_DISTRICTS.GEUMCHEON,
    ],
  },
  DOWNTOWN_AREA: {
    name: '도심권',
    districts: [
      SEOUL_DISTRICTS.JUNG,
      SEOUL_DISTRICTS.JONGNO,
      SEOUL_DISTRICTS.YONGSAN,
      SEOUL_DISTRICTS.SEODAEMUN,
    ],
  },
  EAST_AREA: {
    name: '동부권',
    districts: [
      SEOUL_DISTRICTS.SEONGDONG,
      SEOUL_DISTRICTS.GWANGJIN,
      SEOUL_DISTRICTS.DONGDAEMUN,
      SEOUL_DISTRICTS.JUNGNANG,
    ],
  },
  SOUTH_AREA: {
    name: '남부권',
    districts: [
      SEOUL_DISTRICTS.DONGJAK,
      SEOUL_DISTRICTS.GWANAK,
      SEOUL_DISTRICTS.YEONGDEUNGPO,
    ],
  },
  NORTHWEST_AREA: {
    name: '서북권',
    districts: [SEOUL_DISTRICTS.EUNPYEONG, SEOUL_DISTRICTS.MAPO],
  },
} as const;

// ===== 편의 함수들 =====
export const getDistrictId = (districtCode: SeoulDistrict): number => {
  return SEOUL_DISTRICT_IDS[districtCode];
};

export const getDistrictCode = (id: number): SeoulDistrict | undefined => {
  return DISTRICT_ID_TO_CODE[id];
};

export const getDistrictName = (districtCode: SeoulDistrict): string => {
  return SEOUL_DISTRICT_LABELS[districtCode];
};

export const getDistrictNameById = (id: number): string => {
  const code = getDistrictCode(id);
  return code ? getDistrictName(code) : `Unknown(${id})`;
};

// 지역 옵션 생성 함수 (컴포넌트에서 사용)
export const createRegionOptions = () => {
  return Object.values(SEOUL_DISTRICTS).map((districtCode) => ({
    code: districtCode,
    name: getDistrictName(districtCode),
    id: getDistrictId(districtCode),
  }));
};
