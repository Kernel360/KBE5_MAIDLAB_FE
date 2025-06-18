import type { BoardType } from '@/constants/board';

/**
 * 이미지 정보
 */
export interface ImageInfo {
  imagePath: string;
  name: string;
}

/**
 * 답변 정보
 */
export interface Answer {
  answerId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 게시글 작성 요청
 */
export interface BoardCreateRequest {
  boardType: BoardType;
  title: string;
  content: string;
  images: ImageInfo[];
}

/**
 * 게시글 수정 요청
 */
export interface BoardUpdateRequest {
  title: string;
  content: string;
  boardType: BoardType;
  images: ImageInfo[];
}

/**
 * 게시글 응답 (목록용)
 */
export interface BoardResponse {
  boardId: number;
  title: string;
  content: string;
  answered: boolean;
  boardType: BoardType;
  createdAt: string;
  updatedAt: string;
}

/**
 * 게시글 상세 응답
 */
export interface BoardDetailResponse {
  boardId: number;
  title: string;
  content: string;
  answered: boolean;
  boardType: BoardType;
  images: ImageInfo[];
  answer?: Answer;
  createdAt: string;
  updatedAt: string;
}

/**
 * 답변 작성 요청 (관리자용)
 */
export interface AnswerCreateRequest {
  content: string;
}

/**
 * 답변 수정 요청 (관리자용)
 */
export interface AnswerUpdateRequest {
  content: string;
}

/**
 * 게시판 검색 필터
 */
export interface BoardSearchFilter {
  keyword?: string;
  boardType?: BoardType;
  answered?: boolean;
  startDate?: string;
  endDate?: string;
}

/**
 * 게시글 통계
 */
export interface BoardStats {
  totalBoards: number;
  answeredBoards: number;
  unansweredBoards: number;
  boardsByType: Record<BoardType, number>;
}
