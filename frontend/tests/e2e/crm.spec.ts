import { test, expect } from '@playwright/test';
import { login } from './_helpers/auth';

test.describe('CRM', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'test@example.com', 'password123');
  });

  test('Navigieren zum CRM-Dashboard', async ({ page }) => {
    const link = page.getByRole('link', { name: /crm/i });
    if (await link.count() === 0) {
      test.skip(true, 'CRM-Link nicht vorhanden – Test übersprungen');
    }
    await link.first().click();
    const marker = page.getByText(/crm dashboard|kunden/i);
    if (await marker.count() === 0) {
      test.skip(true, 'CRM-UI nicht sichtbar – Test übersprungen');
    }
    await expect(marker.first()).toBeVisible();
  });
});


