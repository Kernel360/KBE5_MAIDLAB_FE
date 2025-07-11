// 위치 정보(Geolocation) 관련 타입 정의

/**
 * 위치 좌표 타입
 */
export interface Location {
  latitude: number;
  longitude: number;
}

/**
 * 위치 정보 상태 타입
 */
export interface GeolocationState {
  location: Location | null;
  loading: boolean;
  error: string | null;
}

/**
 * 위치 정보 액션 타입
 */
export interface GeolocationActions {
  getCurrentLocation: () => void;
  calculateDistance: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => number;
}

/**
 * useGeolocation 훅의 반환 타입
 */
export interface UseGeolocationReturn extends GeolocationActions {
  location: Location | null;
  loading: boolean;
  error: string | null;
}

/**
 * 위치 정보 옵션 타입
 */
export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

/**
 * 위치 정보 에러 타입
 */
export interface GeolocationError {
  code: number;
  message: string;
}

/**
 * 위치 정보 권한 상태 타입
 */
export type GeolocationPermission = 'granted' | 'denied' | 'prompt' | 'unknown';

/**
 * 거리 계산 결과 타입
 */
export interface DistanceResult {
  distance: number;
  unit: 'km' | 'mi';
}

/**
 * 위치 정보 상세 타입 (브라우저 Position API와 호환)
 */
export interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy?: number;
    altitudeAccuracy?: number;
    heading?: number;
    speed?: number;
  };
  timestamp: number;
}
