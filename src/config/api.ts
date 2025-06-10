import axios from 'axios';
import { config } from '@/config/env';

export const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 에러 처리
    if (error.response) {
      // 서버 응답이 있는 경우
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // 요청은 보냈지만 응답이 없는 경우
      console.error('No response received:', error.request);
    } else {
      // 요청 설정 중 에러가 발생한 경우
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  },
);
