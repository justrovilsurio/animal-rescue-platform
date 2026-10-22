import { expect, type Page } from '@playwright/test';

export const SLUG = '/second-wind';
export const GROUP = 'Second Wind Rescue';

/** The demo page starts private. Publish it from the dashboard, as a group would. */
export async function publishPage(page: Page) {
  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Publish page' }).click();
  await expect(page.getByRole('heading', { name: 'Visitors can see your page' })).toBeVisible();
}

/** Edits autosave after a short debounce; wait until localStorage has caught up. */
export async function waitForSave(page: Page, text: string) {
  await page.waitForFunction((t) => (localStorage.getItem('kindred:v1') ?? '').includes(t), text);
}

/** Nothing on the page should push the layout wider than the screen. */
export async function expectNoSideScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, 'page is wider than the viewport').toBeLessThanOrEqual(1);
}
