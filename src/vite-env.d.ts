/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // add other env vars here if needed
  readonly VITE_SOME_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
