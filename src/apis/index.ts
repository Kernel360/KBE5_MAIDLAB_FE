import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

const BASE_URL = 'https://api-maidlab.duckdns.org';

// Axios 인스턴스 생성
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터 - 에러 처리 및 토큰 갱신
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 토큰 갱신 시도
        const refreshResponse = await apiClient.post('/api/auth/refresh');
        const newToken = refreshResponse.data.data.accessToken;

        localStorage.setItem('accessToken', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        // 리프레시 실패 시 로그아웃 처리
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  message: string;
  code: string;
}

// 공통 에러 처리 함수
export const handleApiError = (error: any) => {
  if (error.response) {
    const { status, data } = error.response;
    console.error(`API Error ${status}:`, data.message || data);
    return data.message || '서버 오류가 발생했습니다.';
  } else if (error.request) {
    console.error('Network Error:', error.request);
    return '네트워크 오류가 발생했습니다.';
  } else {
    console.error('Error:', error.message);
    return '알 수 없는 오류가 발생했습니다.';
  }
};

export * from './auth';
export * from './reservation';
export * from './manager';
export * from './consumer';
export * from './matching';
export * from './event';
export * from './admin';
export * from './board';
