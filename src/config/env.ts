export const config = {
  // API 설정
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,

  // 앱 기본 설정
  appName: import.meta.env.VITE_APP_NAME,
  appVersion: import.meta.env.VITE_APP_VERSION,

  // 환경 설정
  isDevelopment: import.meta.env.VITE_APP_ENV === 'development',
  isProduction: import.meta.env.VITE_APP_ENV === 'production',
  isTest: import.meta.env.VITE_APP_ENV === 'test',
  debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
  enableMock: import.meta.env.VITE_ENABLE_MOCK === 'true',

  // 지역화 설정
  defaultLocale: import.meta.env.VITE_DEFAULT_LOCALE,
  defaultTimezone: import.meta.env.VITE_DEFAULT_TIMEZONE,

  // 소셜 로그인 설정
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  googleClientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
  googleRedirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,

  // 구글맵 설정
  googleMapApiKey: import.meta.env.VITE_GOOGLEMAP_API_KEY,
} as const;

// 환경 변수 유효성 검사
const requiredEnvVars = [
  'VITE_API_BASE_URL',
  'VITE_APP_NAME',
  'VITE_APP_ENV',
] as const;

requiredEnvVars.forEach((envVar) => {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
