import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Dev-time proxy to the Spring Boot backend (branch fet--UserAndDonorModule)
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:5174',
        changeOrigin: true,
      },
    },
  },
});
