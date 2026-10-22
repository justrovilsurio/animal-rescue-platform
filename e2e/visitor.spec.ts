import { expect, test } from '@playwright/test';
import { GROUP, SLUG, expectNoSideScroll, publishPage } from './helpers';

test.describe('a visitor', () => {
  test('sees "not public yet" until the group publishes the page', async ({ page }) => {
    await page.goto(SLUG);
    await expect(page.getByRole('heading', { name: "This page isn't public yet" })).toBeVisible();

    await publishPage(page);
    await page.goto(SLUG);
    await expect(page.getByRole('heading', { level: 1, name: GROUP })).toBeVisible();
  });

  test('can read every section of a published page, in the fixed order', async ({ page }) => {
    await publishPage(page);
    await page.goto(SLUG);
    const order = ['Rescue Gallery', 'For Adoption', 'Before you adopt', 'Updates from adopters', 'Events', 'Meet our team', 'Volunteer', 'Donation campaigns', 'Care guides'];
    await expect(page.getByRole('heading', { level: 2 })).toHaveText(order);
    await expectNoSideScroll(page);
  });

  test('never sees drafts', async ({ page }) => {
    await publishPage(page);
    await page.goto(SLUG);
    // Juniper (rescue), Smoke (update) and Paolo (team) are drafts in the demo data.
    await expect(page.getByText('Juniper')).toHaveCount(0);
    await expect(page.getByText('Smoke learned to trust people again')).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'Meet our team' }).getByRole('heading', { name: 'Paolo' })).toHaveCount(0);
  });

  test('opens an animal, shares its link, and closes it with Escape', async ({ page }) => {
    await publishPage(page);
    await page.goto(SLUG);
    await page.getByRole('link', { name: /^Mango,/ }).click();

    const dialog = page.getByRole('dialog', { name: 'Mango' });
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${SLUG}/adopt/mango$`));
    await expect(dialog.getByRole('link', { name: /Email about Mango/ })).toHaveAttribute('href', /^mailto:hello@secondwind\.ph/);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('heading', { level: 1, name: GROUP })).toBeVisible(); // back on the page underneath
  });

  test('can open a shared animal link directly', async ({ page }) => {
    await publishPage(page);
    await page.goto(`${SLUG}/adopt/kiko`);
    await expect(page.getByRole('dialog', { name: 'Kiko' })).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'For Adoption' })).toBeVisible();
  });

  test('filters animals for adoption and recovers from an empty result', async ({ page }) => {
    await publishPage(page);
    await page.goto(`${SLUG}/adopt`);
    await page.getByRole('button', { name: 'Cats' }).click();
    await expect(page.getByRole('link', { name: /^Saffron,/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /^Mango,/ })).toHaveCount(0);

    await page.getByLabel('Location').selectOption('Antipolo');
    await expect(page.getByText('No animals match those filters')).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters' }).first().click();
    await expect(page.getByRole('link', { name: /^Mango,/ })).toBeVisible();
    await expectNoSideScroll(page);
  });

  test('goes from the stat tile to the full adoption gallery', async ({ page }) => {
    await publishPage(page);
    await page.goto(SLUG);
    await page.getByRole('link', { name: /looking for a home/ }).click();
    await expect(page).toHaveURL(new RegExp(`${SLUG}/adopt$`));
    await expect(page.getByRole('heading', { level: 1, name: 'For Adoption' })).toBeVisible();
  });

  test('gets a clear message for a page that does not exist', async ({ page }) => {
    await page.goto('/no-such-group');
    await expect(page.getByRole('heading', { name: "We couldn't find that page" })).toBeVisible();
  });
});
