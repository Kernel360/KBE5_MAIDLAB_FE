export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  APP_NAME: import.meta.env.VITE_APP_NAME,
  APP_VERSION: import.meta.env.VITE_APP_VERSION,
  DEFAULT_LOCALE: import.meta.env.VITE_DEFAULT_LOCALE,
  DEFAULT_TIMEZONE: import.meta.env.VITE_DEFAULT_TIMEZONE,
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  KAKAO_CLIENT_ID: import.meta.env.VITE_KAKAO_CLIENT_ID,
  GOOGLE_REDIRECT_URI: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
  KAKAO_REDIRECT_URI: import.meta.env.VITE_KAKAO_REDIRECT_URI,
  IS_DEV: import.meta.env.VITE_APP_ENV === 'development',
  IS_PROD: import.meta.env.VITE_APP_ENV === 'production',
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  ENABLE_MOCK: import.meta.env.VITE_ENABLE_MOCK === 'true',
  MAX_FILE_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '5242880'),
  SESSION_TIMEOUT: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '1800000'),
  ...(function validateEnv() {
    const required = ['VITE_API_BASE_URL'];
    const missing = required.filter((key) => !import.meta.env[key]);
    if (missing.length > 0) {
      console.warn(`Missing environment variables: ${missing.join(', ')}`);
    }
    return {};
  })(),
} as const;
