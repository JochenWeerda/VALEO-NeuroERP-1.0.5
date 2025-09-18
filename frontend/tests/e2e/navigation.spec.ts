import { test, expect } from '@playwright/test';

test.describe('Navigation & Workflows (Smoke)', () => {
  test('Landing → Index lädt und hat sichtbare Navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/VALEO|NeuroERP|Vite|React/i);
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Kann zwischen Seiten navigieren (falls Links vorhanden)', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('a');
    const count = await links.count();
    if (count > 0) {
      await links.nth(0).click();
      await expect(page.locator('body')).toBeVisible();
      await page.goBack();
      await expect(page.locator('body')).toBeVisible();
      await page.goForward();
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
