import { apiCall } from '../index';
import type {
  BoardCreateRequest,
  BoardResponse,
  BoardDetailResponse,
  BoardUpdateRequest,
} from '@/types/board';
import { API_ENDPOINTS } from '@/constants/api';

export const boardApi = {
  /**
   * 게시판 목록 조회
   */
  getBoardList: async (): Promise<BoardResponse[]> => {
    return apiCall<BoardResponse[]>('get', API_ENDPOINTS.BOARD.LIST);
  },

  /**
   * 게시판 상세 조회
   */
  getBoard: async (boardId: number): Promise<BoardDetailResponse> => {
    return apiCall<BoardDetailResponse>(
      'get',
      API_ENDPOINTS.BOARD.DETAIL(boardId),
    );
  },

  /**
   * 게시판 생성
   */
  createBoard: async (data: BoardCreateRequest): Promise<void> => {
    return apiCall<void>('post', API_ENDPOINTS.BOARD.CREATE, data);
  },

  /**
   * 게시글 수정
   */
  updateBoard: async (
    boardId: number,
    data: BoardUpdateRequest,
  ): Promise<string> => {
    return apiCall<string>('patch', `/api/board/${boardId}`, data);
  },
};
