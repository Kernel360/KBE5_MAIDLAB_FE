import type {
  BoardResponse,
  BoardDetailResponse,
  BoardCreateRequest,
  AnswerCreateRequest,
} from './board';
import type {
  ReservationListResponse,
  ReservationDetailResponse,
  ReservationCreateRequest,
} from './reservation';

/**
 * API 응답과 내부 타입 간 매핑 유틸리티
 */
export namespace ApiMapper {
  // ===== 게시판 관련 매핑 =====

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
  export const mapBoardDetailResponse = (
    apiData: any,
  ): BoardDetailResponse => ({
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

  // ===== 예약 관련 매핑 =====

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

  /**
   * API 예약 상세 응답 → 내부 타입
   */
  export const mapReservationDetailResponse = (
    apiData: any,
  ): ReservationDetailResponse => ({
    serviceType: apiData.serviceType,
    serviceDetailType: apiData.serviceDetailType,
    address: apiData.address,
    addressDetail: apiData.addressDetail,
    managerUuId: apiData.managerUuId,
    managerName: apiData.managerName,
    managerProfileImageUrl: apiData.managerProfileImageUrl,
    managerAverageRate: apiData.managerAverageRate,
    managerRegion: apiData.managerRegion || [],
    managerPhoneNumber: apiData.managerPhoneNumber,
    housingType: apiData.housingType,
    roomSize: apiData.roomSize,
    housingInformation: apiData.housingInformation,
    reservationDate: apiData.reservationDate,
    startTime: apiData.startTime,
    endTime: apiData.endTime,
    serviceAdd: apiData.serviceAdd,
    pet: apiData.pet,
    specialRequest: apiData.specialRequest,
    totalPrice: apiData.totalPrice,
  });

  /**
   * 내부 예약 생성 요청 → API 요청
   */
  export const mapReservationCreateToApi = (
    data: ReservationCreateRequest,
  ): any => ({
    serviceDetailTypeId: data.serviceDetailTypeId,
    address: data.address,
    addressDetail: data.addressDetail,
    managerUuId: data.managerUuId,
    housingType: data.housingType,
    roomSize: data.roomSize,
    housingInformation: data.housingInformation,
    reservationDate: data.reservationDate,
    startTime: data.startTime,
    endTime: data.endTime,
    serviceAdd: data.serviceAdd,
    pet: data.pet,
    specialRequest: data.specialRequest,
    totalPrice: data.totalPrice,
  });

  // ===== 공통 매핑 =====

  /**
   * API 에러를 내부 에러 타입으로 변환
   */
  export const mapApiError = (
    error: any,
  ): { code: string; message: string } => {
    return {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || '알 수 없는 오류가 발생했습니다.',
    };
  };

  /**
   * 페이지네이션 응답 매핑
   */
  export const mapPaginationResponse = <T, U>(
    apiData: any,
    itemMapper: (item: T) => U,
  ): {
    content: U[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  } => ({
    content: apiData.content.map(itemMapper),
    totalPages: apiData.totalPages,
    totalElements: apiData.totalElements,
    size: apiData.size,
    number: apiData.number,
  });
}
