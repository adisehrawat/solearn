/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOLANA_NETWORK?: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Global Buffer type for browser compatibility
declare global {
  interface Window {
    Buffer: typeof import('buffer').Buffer;
  }
  const Buffer: typeof import('buffer').Buffer;
}
