// 기존 API 클라이언트 수정 (디버깅 포함)
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

const BASE_URL =
  // import.meta.env.VITE_API_BASE_URL || 'https://api-maidlab.duckdns.org';
  'http://localhost:8080';

// API 에러 코드 매핑 (백엔드와 동일)
const API_CODE_MESSAGES = {
  SU: '성공',
  VF: '입력값 검증에 실패했습니다.',
  AF: '인증에 실패했습니다.',
  LF: '로그인에 실패했습니다.',
  DBE: '데이터베이스 오류가 발생했습니다.',
  DT: '이미 가입되어있는 휴대폰번호입니다.',
  DR: '중복된 예약입니다.',
  WR: '올바르지 않은 주소입니다.',
  NP: '권한이 없습니다.',
  NR: '요청한 정보를 찾을 수 없습니다.',
  AWC: '이미 진행중이거나 완료된 작업입니다.',
  AC: '이미 처리된 상태입니다.',
  AD: '삭제된 계정입니다.',
  RF: '유효하지 않은 토큰입니다.',
} as const;

// 토큰 갱신 상태 관리
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}> = [];

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

// 인증이 필요하지 않은 엔드포인트 목록
const PUBLIC_ENDPOINTS = [
  '/api/auth/login',
  '/api/auth/sign-up',
  '/api/auth/social-login',
  '/api/auth/refresh',
];

// 디버깅 함수 (수정된 버전)
const isPublicEndpoint = (url: string): boolean => {
  // 정확한 매칭을 위해 URL에서 엔드포인트 경로만 추출
  const urlPath = url.replace(/^https?:\/\/[^\/]+/, '').split('?')[0];
  const isPublic = PUBLIC_ENDPOINTS.includes(urlPath);

  return isPublic;
};

// API 클라이언트 생성
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // 쿠키를 자동으로 포함하도록 설정
  headers: {
    'Content-Type': 'application/json', // 기본 Content-Type 설정
  },
});

// 요청 인터셉터 - 토큰 자동 추가 (수정된 버전)
apiClient.interceptors.request.use(
  (config) => {
    const url = config.url || '';
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
    const isPublic = isPublicEndpoint(fullUrl);

    if (!isPublic) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      if (config.headers.Authorization) {
        delete config.headers.Authorization;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터 - 에러 처리 및 토큰 갱신 (동시성 처리 개선)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || '';

    console.error(
      `❌ API 에러: ${url}`,
      error.response?.status,
      error.response?.data,
    );

    // 401 에러이고 재시도하지 않은 경우, 그리고 공개 엔드포인트가 아닌 경우에만 토큰 갱신 시도
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isPublicEndpoint(
        originalRequest.url.startsWith('http')
          ? originalRequest.url
          : `${BASE_URL}${originalRequest.url}`,
      )
    ) {
      if (isRefreshing) {
        // 이미 토큰 갱신 중이면 큐에 대기
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
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
        // 토큰 갱신 시도 (쿠키는 자동으로 포함됨)
        const refreshResponse = await apiClient.post('/api/auth/refresh');
        const newToken = refreshResponse.data.data.accessToken;

        localStorage.setItem('accessToken', newToken);

        // 대기 중인 요청들 처리
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 리프레시 실패 시 로그아웃 처리
        console.error('❌ 토큰 갱신 실패:', refreshError);
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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

// 공통 에러 처리 함수 (개선된 버전)
export const handleApiError = (error: any): string => {
  console.error('🔍 에러 분석 시작:', error);

  // 네트워크 오류 체크
  if (!error.response && error.request) {
    return '네트워크 연결을 확인해주세요.';
  }

  if (error.response) {
    const { status, data } = error.response;

    // 백엔드 에러 코드가 있는 경우 우선 처리
    if (
      data &&
      data.code &&
      API_CODE_MESSAGES[data.code as keyof typeof API_CODE_MESSAGES]
    ) {
      const koreanMessage =
        API_CODE_MESSAGES[data.code as keyof typeof API_CODE_MESSAGES];
      return koreanMessage;
    }

    // 백엔드 메시지가 있는 경우
    if (data && data.message) {
      return data.message;
    }

    // 상태 코드별 구체적인 메시지
    switch (status) {
      case 400:
        console.log('⚠️ 400 에러 처리');
        return '잘못된 요청입니다.';
      case 401:
        console.log('🔐 401 에러 처리');
        return '로그인이 필요합니다.';
      case 403:
        console.log('🚫 403 에러 처리');
        return '권한이 없습니다.';
      case 404:
        console.log('🔍 404 에러 처리');
        return '요청한 리소스를 찾을 수 없습니다.';
      case 409:
        console.log('⚡ 409 에러 처리');
        return '이미 존재하는 데이터입니다.';
      case 429:
        console.log('⏰ 429 에러 처리');
        return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
      case 500:
        console.log('💥 500 에러 처리');
        return '서버 내부 오류가 발생했습니다.';
      case 502:
        console.log('🔧 502 에러 처리');
        return '서버에 일시적인 문제가 발생했습니다.';
      case 503:
        console.log('🚨 503 에러 처리');
        return '서비스를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.';
      default:
        console.error(`❓ 알 수 없는 상태코드 ${status}:`, data);
        return `서버 오류가 발생했습니다. (${status})`;
    }
  } else if (error.request) {
    console.error('🌐 요청 에러:', error.request);
    return '네트워크 오류가 발생했습니다.';
  } else {
    console.error('🤷 기타 에러:', error.message);
    return error.message || '알 수 없는 오류가 발생했습니다.';
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
