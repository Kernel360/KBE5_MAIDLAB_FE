import type {
  BoardResponse,
  BoardDetailResponse,
  BoardCreateRequest,
  AnswerCreateRequest,
  ReservationListResponse,
} from '@/types';

/**
 * API 응답을 내부 데이터 형식으로 변환하는 제네릭 매퍼
 */
export const mapApiResponseToInternal = <T, U>(
  apiData: T,
  mapper: (data: T) => U,
): U => {
  return mapper(apiData);
};

/**
 * 내부 데이터를 API 요청 형식으로 변환하는 제네릭 매퍼
 */
export const mapInternalToApiRequest = <T, U>(
  internalData: T,
  mapper: (data: T) => U,
): U => {
  return mapper(internalData);
};

/**
 * 배열 데이터를 일괄 변환하는 매퍼
 */
export const mapArrayData = <T, U>(
  dataArray: T[],
  mapper: (item: T, index: number) => U,
): U[] => {
  return dataArray.map(mapper);
};

/**
 * 페이지네이션 응답 데이터 변환 매퍼
 */
export const mapPaginationResponse = <T, U>(
  paginationResponse: {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  },
  itemMapper: (item: T) => U,
): {
  content: U[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
} => {
  return {
    ...paginationResponse,
    content: paginationResponse.content.map(itemMapper),
  };
};

/**
 * 키 이름 변환 매퍼 (camelCase ↔ snake_case 등)
 */
export const mapObjectKeys = <
  T extends Record<string, any>,
  U extends Record<string, any>,
>(
  obj: T,
  keyMapper: (key: string) => string,
): U => {
  const result = {} as U;

  Object.entries(obj).forEach(([key, value]) => {
    const newKey = keyMapper(key) as keyof U;
    result[newKey] = value;
  });

  return result;
};

/**
 * 중첩 객체의 특정 필드만 추출하는 매퍼
 */
export const pickFields = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  fields: K[],
): Pick<T, K> => {
  const result = {} as Pick<T, K>;

  fields.forEach((field) => {
    if (field in obj) {
      result[field] = obj[field];
    }
  });

  return result;
};

/**
 * 중첩 객체의 특정 필드를 제외하는 매퍼
 */
export const omitFields = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  fields: K[],
): Omit<T, K> => {
  const result = { ...obj } as Omit<T, K>;

  fields.forEach((field) => {
    delete (result as any)[field];
  });

  return result;
};

/**
 * null/undefined 값을 기본값으로 대체하는 매퍼
 */
export const mapWithDefaults = <T extends Record<string, any>>(
  obj: T,
  defaultValues: Partial<T>,
): T => {
  const result = { ...obj } as any;

  Object.entries(defaultValues).forEach(([key, defaultValue]) => {
    if (result[key] == null) {
      result[key] = defaultValue;
    }
  });

  return result as T;
};

/**
 * 날짜 문자열을 Date 객체로 변환하는 필드 매퍼
 */
export const mapDateFields = <T extends Record<string, any>>(
  obj: T,
  dateFields: (keyof T)[],
): T => {
  const result = { ...obj } as any;

  dateFields.forEach((field) => {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = new Date(result[field] as string);
    }
  });

  return result as T;
};

/**
 * API 에러를 내부 에러 형식으로 변환하는 매퍼
 */
export const mapApiError = (
  apiError: any,
): { code: string; message: string; field?: string } => {
  return {
    code: apiError.code || apiError.status || 'UNKNOWN_ERROR',
    message:
      apiError.message ||
      apiError.statusText ||
      '알 수 없는 오류가 발생했습니다.',
    field: apiError.field || undefined,
  };
};

/**
 * 조건부 변환 매퍼 (조건에 따라 다른 변환 적용)
 */
export const mapConditional = <T, U, V>(
  data: T,
  condition: (data: T) => boolean,
  trueMapper: (data: T) => U,
  falseMapper: (data: T) => V,
): U | V => {
  return condition(data) ? trueMapper(data) : falseMapper(data);
};

/**
 * 체인 형태로 여러 매퍼를 순차 적용
 */
export const mapChain = <T>(
  data: T,
  ...mappers: Array<(data: any) => any>
): any => {
  return mappers.reduce((acc, mapper) => mapper(acc), data);
};

/**
 * API 응답의 boardId를 id로 변환 (게시판용)
 */
export const mapBoardResponse = (apiData: any) => {
  return {
    ...apiData,
    id: apiData.boardId || apiData.id,
  };
};

/**
 * 예약 데이터의 날짜/시간 필드 변환
 */
export const mapReservationData = (reservationData: any) => {
  return mapDateFields(reservationData, [
    'reservationDate',
    'startTime',
    'endTime',
    'createdAt',
    'updatedAt',
  ]);
};

/**
 * 매니저 프로필 데이터 변환 (averageRate 기본값 적용)
 */
export const mapManagerProfile = (managerData: any) => {
  return mapWithDefaults(managerData, {
    averageRate: 0,
    profileImage: null,
    introduceText: '',
  });
};

// ===== 추가된 매퍼 함수들 =====

/**
 * API 게시글 목록 응답 → 내부 타입
 * API의 boardId를 내부 id로 변환
 */
export const mapBoardListResponse = (apiData: any[]): BoardResponse[] => {
  return apiData.map((item) => ({
    boardId: item.boardId || item.id,
    title: item.title,
    content: item.content,
    answered: item.answered,
    boardType: item.boardType,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
};

/**
 * API 게시글 상세 응답 → 내부 타입
 * API의 boardId를 내부 id로 변환
 */
export const mapBoardDetailResponse = (apiData: any): BoardDetailResponse => ({
  boardId: apiData.boardId || apiData.id,
  title: apiData.title,
  content: apiData.content,
  answered: apiData.answered,
  boardType: apiData.boardType,
  images: apiData.images || [],
  answer: apiData.answer,
  createdAt: apiData.createdAt,
  updatedAt: apiData.updatedAt,
});

/**
 * 내부 게시글 생성 요청 → API 요청
 */
export const mapBoardCreateToApi = (data: BoardCreateRequest): any => ({
  boardType: data.boardType,
  title: data.title,
  content: data.content,
  images: data.images,
});

/**
 * 내부 답변 요청 → API 요청
 */
export const mapAnswerCreateToApi = (data: AnswerCreateRequest): any => ({
  content: data.content,
});

/**
 * API 예약 목록 응답 → 내부 타입
 */
export const mapReservationListResponse = (
  apiData: any[],
): ReservationListResponse[] => {
  return apiData.map((item) => ({
    reservationId: item.reservationId,
    status: item.status,
    serviceType: item.serviceType,
    detailServiceType: item.detailServiceType,
    reservationDate: item.reservationDate,
    startTime: item.startTime,
    endTime: item.endTime,
    isExistReview: item.isExistReview,
    totalPrice: item.totalPrice,
  }));
};
