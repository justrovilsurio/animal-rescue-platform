import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests: the real app in a real browser, through the flows a rescue
 * group and a visitor actually use. Unit and component tests stay in Vitest.
 *
 *   npm run e2e          run everything (desktop + phone)
 *   npm run e2e:ui       Playwright's UI mode, for writing and debugging tests
 *   npm run e2e:report   open the last HTML report
 *
 * Every test gets a fresh browser context, so localStorage starts empty and the
 * app boots from the demo seed each time.
 */
const PORT = 4173;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Scroll reveals hide content until it is in view; reduced motion shows it at once.
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
