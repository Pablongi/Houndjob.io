import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname para compatibilidad con ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],

  publicDir: 'public',
  base: '/',

  server: {
    port: 3000,
    open: true,
    host: '0.0.0.0',
    proxy: {
      // ====================== PROXY CORREGIDO (IMPORTANTE) ======================
      '/api': {
        target: 'http://127.0.0.1:5000',   // ← CAMBIO CRÍTICO: IPv4 explícito
        changeOrigin: true,
        secure: false,
      },

      // Proxy viejo comentado (puedes borrarlo después)
      // '/alloffers': {
      //   target: 'https://houndjobback.fly.dev',
      //   changeOrigin: true,
      //   rewrite: (p) => p,
      // },
    },
  },

  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['styled-components', 'framer-motion'],
          utilities: ['react-window', 'react-virtualized', 'react-slick'],
        },
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      components: path.resolve(__dirname, './src/components'),
      types: path.resolve(__dirname, './src/types'),
      logic: path.resolve(__dirname, './src/logic'),
      utils: path.resolve(__dirname, './src/utils'),
      hooks: path.resolve(__dirname, './src/hooks'),
    },
  },

  optimizeDeps: {
    exclude: ['react-window', 'react-window-infinite-loader'],
  },
});