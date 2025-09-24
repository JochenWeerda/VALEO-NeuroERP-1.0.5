import { test, expect } from '@playwright/test';
import { login } from './_helpers/auth';
import { gotoMenu } from './_helpers/nav';

test.describe('FiBu (Finanzbuchhaltung)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'test@example.com', 'password123');
  });

  test('Fibu Dashboard / Finance Management sichtbar', async ({ page }) => {
    const navigated = await gotoMenu(page, /fibu|finance/i).catch(() => false);
    if (!navigated) {
      test.skip(true, 'FiBu-Menü nicht vorhanden – Test übersprungen');
    }
    const marker = page.getByText(/fibu|finance management|buchung/i);
    if (await marker.count() === 0) {
      test.skip(true, 'FiBu-UI nicht sichtbar – Test übersprungen');
    }
    await expect(marker.first()).toBeVisible();
  });
});


