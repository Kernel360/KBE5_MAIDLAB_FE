// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}
