import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite-конфиг для Telegram WebApp / мобильного SPA
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
});




