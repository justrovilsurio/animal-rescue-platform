import { expect, test } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { SLUG, expectNoSideScroll, publishPage, waitForSave } from './helpers';

const PHOTO = fileURLToPath(new URL('../public/photos/saffron-kitten.webp', import.meta.url));

test.describe('a rescue group', () => {
  test('adds an animal: validation first, then a photo, then publish', async ({ page }) => {
    await publishPage(page);
    await page.goto('/dashboard/animals?show=adopt');
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'New animal' })).toBeVisible();

    // Publishing an empty draft explains exactly what is missing.
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    await expect(page.getByText('Give them a name, even a temporary one.')).toBeVisible();
    await expect(page.getByText('Add a cover photo. It is what visitors see first.')).toBeVisible();

    await page.getByLabel('Name', { exact: true }).fill('Pepper');
    await page.locator('input[type="file"]').first().setInputFiles(PHOTO);
    await expect(page.getByRole('img', { name: 'Cover photo' })).toBeVisible();
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    await expect(page.getByText('Pepper is now on your page.')).toBeVisible();

    await page.goto(`${SLUG}/adopt`);
    await expect(page.getByRole('link', { name: /^Pepper,/ })).toBeVisible();
  });

  test('edits a published animal without changing the live page until "Publish update"', async ({ page }) => {
    await publishPage(page);
    await page.goto('/dashboard/edit/adopt/mango');
    await page.getByLabel('Name', { exact: true }).fill('Mango the Brave');
    await expect(page.getByRole('region', { name: 'Publishing' }).getByText('Unpublished edits')).toBeVisible();
    await waitForSave(page, 'Mango the Brave');

    await page.goto(`${SLUG}/adopt`);
    await expect(page.getByRole('link', { name: /^Mango,/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /^Mango the Brave,/ })).toHaveCount(0);

    await page.goto('/dashboard/edit/adopt/mango');
    await page.getByRole('button', { name: 'Publish update' }).click();
    await page.goto(`${SLUG}/adopt`);
    await expect(page.getByRole('link', { name: /^Mango the Brave,/ })).toBeVisible();
  });

  test('hides a section from visitors, and can undo it', async ({ page }) => {
    await publishPage(page);
    const events = page.getByRole('switch', { name: 'Events' });
    await events.click();
    await expect(events).toHaveAttribute('aria-checked', 'false');

    await page.getByRole('button', { name: 'Undo' }).click();
    await expect(events).toHaveAttribute('aria-checked', 'true');

    await events.click();
    await waitForSave(page, '"events":false');
    await page.goto(SLUG);
    await expect(page.getByRole('heading', { level: 2, name: 'Volunteer' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Events' })).toHaveCount(0);
  });

  test('keeps its changes after a reload', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByLabel('Page name').fill('Paws of Pasig');
    await waitForSave(page, 'Paws of Pasig');
    await page.reload();
    await expect(page.getByLabel('Page name')).toHaveValue('Paws of Pasig');
  });

  test('adds a team member who then appears on the page', async ({ page }) => {
    await publishPage(page);
    await page.goto('/dashboard/community?show=team');
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.getByLabel('Name', { exact: true }).fill('Lia');
    await page.getByLabel(/^Role/).fill('Kennel lead');
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    await expect(page.getByText('Lia is now on your page.')).toBeVisible();

    await page.goto(SLUG);
    const team = page.getByRole('region', { name: 'Meet our team' });
    await expect(team.getByRole('heading', { name: 'Lia' })).toBeVisible();
    await expect(team.getByText('Kennel lead')).toBeVisible();
  });

  test('every dashboard screen fits the screen width', async ({ page }) => {
    for (const url of ['/dashboard', '/dashboard/animals', '/dashboard/community', '/dashboard/community?show=team', '/dashboard/account', '/dashboard/edit/adopt/mango', '/dashboard/edit/team/t-ana']) {
      await page.goto(url);
      await expect(page.locator('#dash-main')).toBeVisible();
      await expectNoSideScroll(page);
    }
  });

  test('previews drafts that visitors cannot see', async ({ page }) => {
    await page.goto('/dashboard/preview');
    await expect(page.getByRole('note').getByText('Preview.')).toBeVisible();
    await expect(page.getByText('Juniper')).toBeVisible(); // a draft rescue, shown only in preview
    await expectNoSideScroll(page);
  });
});
