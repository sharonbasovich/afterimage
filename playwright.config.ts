import {defineConfig, devices} from '@playwright/test';
const externalURL = process.env.PLAYWRIGHT_BASE_URL;
if (externalURL && !new URL(externalURL).pathname.endsWith('/')) throw new Error('PLAYWRIGHT_BASE_URL must end with /');
const prefix = process.env.STATIC_PREFIX || '/';
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 180_000,
  expect: {timeout: 15_000},
  reporter: [['list'], ['html', {open: 'never'}], ['json', {outputFile: 'test-results/results.json'}]],
  use: {
    baseURL: externalURL || `http://127.0.0.1:4173${prefix}`,
    trace: 'retain-on-failure', screenshot: 'only-on-failure',
    serviceWorkers: 'block',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? {executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE} : {},
  },
  projects: [
    {name: 'desktop-chromium', use: {...devices['Desktop Chrome']}},
    {name: 'mobile-chromium', use: {...devices['Pixel 7'], contextOptions: {reducedMotion: 'reduce'}}},
  ],
  webServer: externalURL ? undefined : {
    command: 'node scripts/serve-static.mjs',
    url: `http://127.0.0.1:4173${prefix}`, reuseExistingServer: false, timeout: 30_000,
  },
});
