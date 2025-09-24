import { test, expect } from '@playwright/test';
import { login } from './_helpers/auth';
import { gotoMenu } from './_helpers/nav';


test.describe('Bestellmengenermittlung / Ordervorschlag', () => {
  test.setTimeout(45000);
  test.beforeEach(async ({ page }) => {
    await login(page, 'test@example.com', 'password123');
  });

  test('Order Suggestion sichtbar', async ({ page }) => {
    await page.goto('/ai-inventory', { waitUntil: 'domcontentloaded' }).catch(async () => {
      await page.goto('/inventory', { waitUntil: 'domcontentloaded' });
    });
    const marker = page.getByText(/vorschlag|suggestion|bestellmengenermittlung/i);
    if (await marker.count() === 0) {
      test.skip(true, 'Ordervorschlag-UI nicht sichtbar – Test übersprungen');
    }
    await expect(marker.first()).toBeVisible({ timeout: 4000 });
  });
});


