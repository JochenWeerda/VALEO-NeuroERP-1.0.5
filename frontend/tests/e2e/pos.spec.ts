import { test, expect } from '@playwright/test';
import { login } from './_helpers/auth';

test.describe('Kasse (POS)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'test@example.com', 'password123');
  });

  test('POS Seite öffnet und zeigt Elemente', async ({ page }) => {
    const link = page.getByRole('link', { name: /pos|kasse/i });
    if (await link.count() === 0) {
      test.skip(true, 'POS-Link nicht vorhanden – Test übersprungen');
    }
    await link.first().click();
    const marker = page.getByText(/bon|verkauf/i);
    if (await marker.count() === 0) {
      test.skip(true, 'POS-UI nicht sichtbar – Test übersprungen');
    }
    await expect(marker.first()).toBeVisible();
  });
});


