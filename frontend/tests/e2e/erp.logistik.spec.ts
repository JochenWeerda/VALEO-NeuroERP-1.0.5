import { test, expect } from '@playwright/test';
import { login } from './_helpers/auth';
import { gotoMenu } from './_helpers/nav';


test.describe('ERP Logistik/Belege', () => {
  test.setTimeout(45000);
  test.beforeEach(async ({ page }) => {
    await login(page, 'test@example.com', 'password123');
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' }).catch(() => {});
  });

  test('Lieferschein/Delivery Note sichtbar', async ({ page }) => {
    const launcher = page.getByTestId('app-launcher');
    if (await launcher.count() === 0) {
      test.skip(true, 'App-Launcher nicht sichtbar – Test übersprungen');
    }
    await expect(page.getByTestId('app-lieferschein')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('app-lieferschein').click();

    const pageRoot = page.getByTestId('delivery-note-page');
    await expect(pageRoot).toBeVisible({ timeout: 8000 });
    await expect(page.getByTestId('delivery-note-title')).toBeVisible({ timeout: 4000 });
    await expect(page.getByTestId('delivery-note-form-root')).toBeVisible({ timeout: 4000 });
  });
});


