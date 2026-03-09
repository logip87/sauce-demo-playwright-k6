import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env['CI']);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  ...(isCI ? { workers: 2 } : {}),
  reporter: [
    ['list'],
    [
      'html',
      {
        open: 'never',
        outputFolder: 'artifacts/playwright-report',
      },
    ],
    [
      'allure-playwright',
      {
        resultsDir: 'artifacts/allure-results',
        detail: true,
      },
    ],
  ],
  outputDir: 'artifacts/test-results',
  use: {
    baseURL: 'https://www.saucedemo.com',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    testIdAttribute: 'data-test',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
