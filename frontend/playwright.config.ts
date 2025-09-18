import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 110_000,
  expect: { timeout: 10_000 },
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:4173',
    env: {
      PW_REAL_API: process.env.PW_REAL_API || '1',
      PW_API_URL: process.env.PW_API_URL || 'http://localhost:8000',
      PW_API_BASE: process.env.PW_API_BASE || 'http://localhost:8000/api'
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'chrome',
      use: { channel: 'chrome', launchOptions: { devtools: true }, ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] }
    }
  ],
  webServer: {
    command: 'cross-env VITE_E2E=true VITE_API_BASE=' + (process.env.VITE_API_BASE || 'http://localhost:8000/api') + ' npm run dev -- --strictPort --port 4173 --host 0.0.0.0',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 180_000
  }
});
