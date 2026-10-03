/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_WS_BASE_URL: string;
  readonly VITE_USE_MOCK_API: string;
  readonly VITE_DEMO_MODE: string;
  readonly VITE_DEFAULT_360_VIDEO_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Custom JSX types for A-Frame WebXR elements
declare namespace JSX {
  interface IntrinsicElements {
    'a-scene': any;
    'a-assets': any;
    'a-videosphere': any;
    'a-camera': any;
    'a-cursor': any;
    'a-entity': any;
    'a-box': any;
    'a-sky': any;
  }
}
