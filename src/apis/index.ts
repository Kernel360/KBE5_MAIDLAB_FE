import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { tokenStorage } from '@/utils/storage';
import { API_CODE_MESSAGES, API_ENDPOINTS } from '@/constants/api';
import { USER_TYPES } from '@/constants/user';

// 환경변수 검증
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!BASE_URL) {
  throw new Error('VITE_API_BASE_URL 환경변수가 설정되지 않았습니다.');
}

// ===== 타입 정의 강화 =====
interface ApiErrorResponse {
  code?: string;
  message?: string;
}

interface ApiError extends Error {
  response?: {
    status: number;
    data: ApiErrorResponse;
  };
  request?: any;
  code?: string;
  config?: any;
}

interface QueueItem {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

// ===== 토큰 갱신 상태 관리 (개선된 버전) =====
let isRefreshing = false;
let failedQueue: QueueItem[] = [];
const MAX_QUEUE_SIZE = 100; // 메모리 누수 방지

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// 큐 크기 제한 함수
const addToQueue = (item: QueueItem) => {
  if (failedQueue.length >= MAX_QUEUE_SIZE) {
    // 가장 오래된 요청 제거
    failedQueue.shift();
  }
  failedQueue.push(item);
};

// ===== 공개 엔드포인트 처리 (수정된 버전) =====
const PUBLIC_ENDPOINTS = [
  '/api/auth/login',
  '/api/auth/sign-up',
  '/api/auth/social-login',
  '/api/auth/social-sign-up',
  '/api/auth/refresh',
  '/api/admin/auth/login',
  '/api/admin/auth/refresh',
] as const;

const isPublicEndpoint = (url: string): boolean => {
  if (!url) return false;

  try {
    // 절대 URL과 상대 URL 모두 처리
    const path = url.startsWith('http')
      ? new URL(url).pathname
      : url.split('?')[0];

    return PUBLIC_ENDPOINTS.some((endpoint) => path === endpoint);
  } catch (error) {
    // URL 파싱 실패시 안전하게 false 반환
    return false;
  }
};

// 로깅 시스템 제거됨

// ===== API 클라이언트 생성 =====
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  maxContentLength: 10 * 1024 * 1024, // 10MB
  maxBodyLength: 10 * 1024 * 1024, // 10MB
});

// ===== 사용자 타입 확인 함수 =====
const getCurrentUserType = (): string | null => {
  return localStorage.getItem('userType');
};

const isAdminUser = (): boolean => {
  return getCurrentUserType() === USER_TYPES.ADMIN;
};

// ===== 요청 인터셉터 (개선된 버전) =====
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();

    // 소셜 회원가입은 별도 토큰 처리
    if (config.url?.includes('/social-sign-up')) {
      return config;
    }

    // 공개 엔드포인트가 아닌 경우에만 토큰 추가
    if (token && !isPublicEndpoint(config.url || '')) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ===== 응답 인터셉터 (수정된 버전) =====
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: ApiError) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || '';

    // 401 에러이고 재시도하지 않은 경우, 그리고 공개 엔드포인트가 아닌 경우에만 토큰 갱신 시도
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isPublicEndpoint(url)
    ) {
      if (isRefreshing) {
        // 이미 토큰 갱신 중이면 큐에 대기
        return new Promise((resolve, reject) => {
          addToQueue({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 사용자 타입에 따른 토큰 갱신 엔드포인트 선택
        const refreshEndpoint = isAdminUser()
          ? API_ENDPOINTS.ADMIN.AUTH.REFRESH
          : API_ENDPOINTS.AUTH.REFRESH;

        const refreshResponse = await apiClient.post(refreshEndpoint);
        const newToken = refreshResponse.data.data.accessToken;

        // tokenStorage 유틸리티 사용으로 일관성 확보
        tokenStorage.setAccessToken(newToken);

        // 대기 중인 요청들 처리
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 리프레시 실패 시 로그아웃 처리
        processQueue(refreshError, null);

        // tokenStorage 유틸리티 사용
        tokenStorage.clearTokens();

        // 관리자와 일반 사용자 구분하여 리다이렉트
        const redirectPath = isAdminUser() ? '/admin/login' : '/';
        window.location.href = redirectPath;

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ===== 공통 API 호출 함수 (코드 중복 제거) =====
export const apiCall = async <T>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  endpoint: string,
  data?: any,
  config?: any,
): Promise<T> => {
  try {
    const response = await apiClient[method](endpoint, data, config);
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// ===== 개선된 에러 처리 함수 =====
export const handleApiError = (error: unknown): string => {
  const apiError = error as ApiError;

  // 네트워크 오류 체크
  if (!apiError.response && apiError.request) {
    return '네트워크 연결을 확인해주세요.';
  }

  if (apiError.response) {
    const { status, data } = apiError.response;

    // 백엔드 에러 코드 우선 처리
    if (data?.code && typeof data.code === 'string') {
      const errorCode = data.code as keyof typeof API_CODE_MESSAGES;
      if (API_CODE_MESSAGES[errorCode]) {
        return API_CODE_MESSAGES[errorCode];
      }
    }

    // 백엔드 메시지 처리
    if (data?.message && typeof data.message === 'string') {
      return data.message;
    }

    // HTTP 상태 코드별 처리
    const statusMessages: Record<number, string> = {
      400: '잘못된 요청입니다.',
      401: '로그인이 필요합니다.',
      403: '권한이 없습니다.',
      404: '요청한 리소스를 찾을 수 없습니다.',
      409: '이미 존재하는 데이터입니다.',
      429: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      500: '서버 내부 오류가 발생했습니다.',
      502: '서버에 일시적인 문제가 발생했습니다.',
      503: '서비스를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.',
    };

    return statusMessages[status] || `서버 오류가 발생했습니다. (${status})`;
  }

  return apiError.message || '알 수 없는 오류가 발생했습니다.';
};

// ===== 기존 유틸리티 함수들 (그대로 유지) =====
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const validatePaginationParams = (params: {
  page?: number;
  size?: number;
}) => {
  const { page = 0, size = 10 } = params;

  return {
    page: Math.max(0, page),
    size: Math.min(Math.max(1, size), 100),
  };
};

export const buildApiUrl = (
  endpoint: string,
  params?: Record<string, any>,
): string => {
  if (!params || Object.keys(params).length === 0) {
    return endpoint;
  }

  const queryString = buildQueryString(params);
  return `${endpoint}${queryString}`;
};

export const parseQueryString = (url: string): Record<string, string> => {
  const urlObj = new URL(url, window.location.origin);
  const params: Record<string, string> = {};

  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
};

// ===== 개선된 재시도 로직 =====
export const retryRequest = async (
  config: any,
  retries = 3,
  delay = 1000,
): Promise<any> => {
  try {
    return await apiClient(config);
  } catch (error: any) {
    if (
      retries > 0 &&
      (error.code === 'NETWORK_ERROR' ||
        error.code === 'ECONNABORTED' ||
        error.response?.status >= 500)
    ) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryRequest(config, retries - 1, delay * 1.5); // 지수 백오프
    }
    throw error;
  }
};

// ===== 요청 취소 지원 =====
export const createCancellableRequest = () => {
  const controller = new AbortController();

  const request = <T>(config: any): Promise<T> => {
    return apiClient({
      ...config,
      signal: controller.signal,
    });
  };

  const cancel = () => {
    controller.abort();
  };

  return { request, cancel };
};

// ===== API 모듈들 export =====
export * from './auth';
export * from './reservation';
export * from './manager';
export * from './consumer';
export * from './matching';
export * from './event';
export * from './admin';
export * from './board';
