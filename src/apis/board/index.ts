import { apiClient, type ApiResponse, handleApiError } from '../index';

// 게시판 관련 타입 정의
export interface ImageDto {
  imagePath: string;
  name: string;
}

export interface ConsumerBoardResponseDto {
  boardId: number;
  title: string;
  content: string;
  answered: boolean;
  boardType: 'REFUND' | 'MANAGER' | 'SERVICE' | 'ETC';
}

export interface ConsumerBoardDetailResponseDto extends ConsumerBoardResponseDto {
  images: ImageDto[];
  answer?: {
    content: string;
  };
}

export interface ConsumerBoardRequestDto {
  boardType: 'REFUND' | 'MANAGER' | 'SERVICE' | 'ETC';
  title: string;
  content: string;
  images: ImageDto[];
}

// 답변 등록 요청 타입
export interface AnswerRequestDto {
  content: string;
}

// 게시글 수정 요청 타입
export interface BoardUpdateRequestDto {
  title: string;
  content: string;
  boardType: 'REFUND' | 'MANAGER' | 'SERVICE' | 'ETC';
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

  // 답변 등록
  answerBoard: async (boardId: number, data: AnswerRequestDto): Promise<void> => {
    try {
      await apiClient.post<ApiResponse<void>>(
        `/api/board/${boardId}/answer`,
        data,
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 게시글 수정
  updateBoard: async (
    boardId: number,
    data: BoardUpdateRequestDto,
  ): Promise<string> => {
    try {
      const response = await apiClient.patch<ApiResponse<string>>(
        `/api/board/${boardId}`,
        data,
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
