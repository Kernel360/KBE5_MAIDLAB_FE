/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_ENV: 'development' | 'production' | 'test';
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_ENABLE_MOCK: string;
  readonly VITE_DEFAULT_LOCALE: string;
  readonly VITE_DEFAULT_TIMEZONE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
