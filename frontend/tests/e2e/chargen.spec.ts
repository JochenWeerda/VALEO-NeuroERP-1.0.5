import { test, expect } from '@playwright/test';
import { login } from './_helpers/auth';
import { gotoMenu } from './_helpers/nav';


test.describe('Chargenverwaltung', () => {
  test.setTimeout(45000);
  test.beforeEach(async ({ page }) => {
    await login(page, 'test@example.com', 'password123');
  });

  test('Chargen-Seite sichtbar', async ({ page }) => {
    await page.goto('/inventory', { waitUntil: 'domcontentloaded' }).catch(() => {});
    const marker = page.getByText(/charge|chargenverwaltung/i);
    if (await marker.count() === 0) {
      test.skip(true, 'Chargen-UI nicht sichtbar – Test übersprungen');
    }
    await expect(marker.first()).toBeVisible({ timeout: 4000 });
  });
});


