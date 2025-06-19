/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_DEFAULT_LOCALE: string;
  readonly VITE_DEFAULT_TIMEZONE: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GOOGLE_REDIRECT_URI: string;
  readonly VITE_APP_ENV: 'development' | 'production' | 'test';
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_ENABLE_MOCK: string;
  readonly VITE_MAX_FILE_SIZE: string;
  readonly VITE_SUPPORTED_LOCALES: string;
  readonly VITE_SESSION_TIMEOUT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
