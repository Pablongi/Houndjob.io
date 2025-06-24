import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  base: '/',
  server: {
    port: 3000,
    open: true,
    host: '0.0.0.0',
    proxy: {
      '/alloffers': {
        target: 'https://houndjobback.fly.dev',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
  build: {
    target: 'esnext',
  },
  resolve: {
    alias: {
      '@': '/src',
      'components': '/src/components',
      'types': '/src/types',
      'logic': '/src/logic',
      'utils': '/src/utils'
    },
  },
});