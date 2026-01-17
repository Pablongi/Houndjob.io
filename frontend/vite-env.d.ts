/// <reference types="vite/client" />
interface ImportMetaEnv {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  // Agrega otros env si necesitas
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}