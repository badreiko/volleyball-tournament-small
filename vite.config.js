import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true, // Автоматически открывать браузер при запуске
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist', // Папка для сборки
    sourcemap: true, // Генерировать sourcemaps
    minify: 'esbuild', // Минификация с помощью esbuild
  },
  resolve: {
    alias: {
      '@': '/src', // Алиас для упрощения импорта
    },
  },
});