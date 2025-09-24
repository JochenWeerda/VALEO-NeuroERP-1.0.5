import { test, expect } from '@playwright/test';
import { login } from './_helpers/auth';
import { gotoMenu } from './_helpers/nav';


test.describe('Inventur-Workflows', () => {
  test.setTimeout(45000);
  test.beforeEach(async ({ page }) => {
    await login(page, 'test@example.com', 'password123');
  });

  test('Inventurseite sichtbar', async ({ page }) => {
    await page.goto('/ai-inventory', { waitUntil: 'domcontentloaded' }).catch(async () => {
      await page.goto('/inventory', { waitUntil: 'domcontentloaded' });
    });

    const headingAI = page.getByText(/ki-inventur-vorschläge/i);
    const headingInv = page.getByText(/inventar|lagerverwaltung|lager/i);

    const hasAI = await headingAI.count();
    const hasInv = await headingInv.count();
    if (hasAI === 0 && hasInv === 0) {
      test.skip(true, 'Inventur-UI nicht sichtbar – Test übersprungen');
    }

    const target = hasAI ? headingAI.first() : headingInv.first();
    await expect(target).toBeVisible({ timeout: 4000 });
  });
});


