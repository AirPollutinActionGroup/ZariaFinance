import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server proxies /api to the Spring Boot backend (backend/finance runs on
// server.port=5174). In the docker-compose deployment nginx performs the same
// routing, so the app always calls relative /api URLs and never hardcodes a host.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:5174',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Vendor chunking keeps route-level changes from invalidating the
    // (much larger) framework bundles in users' caches.
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          data: ['@tanstack/react-query', 'axios', 'react-hook-form', 'zod'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setupTests.js'],
    include: ['src/**/*.test.{js,jsx}'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,jsx}'],
      // Non-testable / generated sources are excluded so the ratio reflects
      // real application logic.
      exclude: [
        'src/**/*.test.{js,jsx}',
        'src/**/*.stories.{js,jsx}',
        'src/test/**',
        'src/main.jsx',
        'src/**/*.d.ts',
      ],
      // No thresholds here on purpose: `test:coverage` is report-only (safe for
      // CI). The 60% gate is opt-in via the `coverage:check` script.
    },
  },
});
