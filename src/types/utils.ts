import type {
  BoardResponse,
  BoardDetailResponse,
  BoardCreateRequest,
  AnswerCreateRequest,
} from './board';
import type { ReservationListResponse } from './reservation';

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

  // 예약 관련 매핑 함수들은 타입 안전성 문제로 제거됨
  // 필요시 각 도메인에서 직접 타입 안전한 변환 로직 구현

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

/**
 * 스토리지 아이템 타입
 */
export interface StorageItem<T> {
  value: T;
  expiry: number;
}

/**
 * S3 Presigned URL 응답 타입
 */
export interface PresignedUrlResponse {
  key: string;
  url: string; // presigned URL
}

/**
 * OAuth 팝업 설정 타입
 */
export interface PopupConfig {
  width: number;
  height: number;
  timeout: number;
  fastPollInterval: number;
  slowPollInterval: number;
  fastPollDuration: number;
}
