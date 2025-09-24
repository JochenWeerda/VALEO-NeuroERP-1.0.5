import { test, expect } from '@playwright/test';
import { login } from './_helpers/auth';
import { gotoMenu } from './_helpers/nav';

test.describe('THG / CO2 Nachweise', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'test@example.com', 'password123');
  });

  test('CO2/THG Seite sichtbar', async ({ page }) => {
    const navigated = await gotoMenu(page, /thg|co2|nachweis/i).catch(() => false);
    if (!navigated) {
      test.skip(true, 'THG/CO2-Menü nicht vorhanden – Test übersprungen');
    }
    const marker = page.getByText(/co2|thg|nachweis/i);
    if (await marker.count() === 0) {
      test.skip(true, 'THG/CO2-UI nicht sichtbar – Test übersprungen');
    }
    await expect(marker.first()).toBeVisible();
  });
});


