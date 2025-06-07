import { apiClient, type ApiResponse, handleApiError } from '../index';
import type {
  ConsumerBoardResponseDto,
  ConsumerBoardDetailResponseDto,
  ImageDto,
} from '../admin';

// 게시판 관련 타입 정의
export interface ConsumerBoardRequestDto {
  boardType: 'REFUND' | 'MANAGER' | 'SERVICE' | 'ETC';
  title: string;
  content: string;
  images: ImageDto[];
}

// 게시판 API 함수들
export const boardApi = {
  // 게시판 목록 조회
  getBoardList: async (): Promise<ConsumerBoardResponseDto[]> => {
    try {
      const response =
        await apiClient.get<ApiResponse<ConsumerBoardResponseDto[]>>(
          '/api/board',
        );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 게시판 상세 조회
  getBoard: async (
    boardId: number,
  ): Promise<ConsumerBoardDetailResponseDto> => {
    try {
      const response = await apiClient.get<
        ApiResponse<ConsumerBoardDetailResponseDto>
      >(`/api/board/${boardId}`);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 게시판 생성
  createBoard: async (data: ConsumerBoardRequestDto): Promise<string> => {
    try {
      const response = await apiClient.post<ApiResponse<string>>(
        '/api/board',
        data,
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
