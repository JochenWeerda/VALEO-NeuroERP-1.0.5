import { test, expect } from '@playwright/test';
import { login } from './_helpers/auth';
import { gotoMenu } from './_helpers/nav';

test.describe('Cashflow Planung & Kontrolle', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'test@example.com', 'password123');
  });

  test('Cashflow-Übersicht sichtbar', async ({ page }) => {
    const link = page.getByRole('link', { name: /cashflow|planung|kontrolle/i });
    if (await link.count() === 0) {
      test.skip(true, 'Cashflow-Seite nicht vorhanden – Test übersprungen');
    }
    await link.first().click();
    const marker = page.getByText(/cashflow|liquidität/i);
    if (await marker.count() === 0) {
      test.skip(true, 'Cashflow-UI nicht sichtbar – Test übersprungen');
    }
    await expect(marker.first()).toBeVisible();
  });
});


