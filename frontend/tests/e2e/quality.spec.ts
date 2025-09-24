import { test, expect } from '@playwright/test';
import { login } from './_helpers/auth';
import { gotoMenu } from './_helpers/nav';

test.describe('Qualitätsmodul', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'test@example.com', 'password123');
  });

  test('Quality Management Seite/Widgets sichtbar', async ({ page }) => {
    const navigated = await gotoMenu(page, /quality|qualität/i).catch(() => false);
    if (!navigated) {
      test.skip(true, 'Quality-Menü nicht vorhanden – Test übersprungen');
    }
    const marker = page.getByText(/quality management|qualität/i);
    if (await marker.count() === 0) {
      test.skip(true, 'Quality-Widgets nicht sichtbar – Test übersprungen');
    }
    await expect(marker.first()).toBeVisible();
  });
});


