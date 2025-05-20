import { API_ENDPOINTS } from '../constants';
import { ApiResponse } from '../types';

// API 요청 기본 설정
const defaultHeaders = {
  'Content-Type': 'application/json',
};

// API 요청 기본 함수
const fetchApi = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> => {
  const response = await fetch(`${API_ENDPOINTS.BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
  return response.json();
};
