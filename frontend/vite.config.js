import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const host = process.env.VITE_HOST || '127.0.0.1';
const port = Number(process.env.VITE_PORT || 5173);
const previewPort = Number(process.env.VITE_PREVIEW_PORT || 4173);
const apiTarget = process.env.VITE_API_TARGET || 'http://127.0.0.1:3000';
const usePolling = process.env.CHOKIDAR_USEPOLLING === 'true';

export default defineConfig({
  plugins: [vue()],
  server: {
    host,
    port,
    watch: usePolling
      ? {
          usePolling: true,
          interval: 500
        }
      : undefined,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true
      }
    }
  },
  preview: {
    host,
    port: previewPort
  }
});
