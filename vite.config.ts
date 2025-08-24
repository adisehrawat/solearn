import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['buffer'],
  },
  define: {
    global: 'globalThis',
  },
  server: {
    host: true,
    port: 5173,
  },
});