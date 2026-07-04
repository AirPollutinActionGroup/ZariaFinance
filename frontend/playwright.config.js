import { defineConfig } from '@playwright/test';

/**
 * End-to-end tests run against the Vite dev server. The API proxy target
 * can be pointed at a running backend via VITE_PROXY_TARGET.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    // Allow CI images that pre-install a Chromium build to point at it
    // instead of downloading browsers (PLAYWRIGHT_CHROMIUM_PATH).
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
      : {},
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
