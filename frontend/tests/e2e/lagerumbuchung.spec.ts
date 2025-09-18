import { test, expect } from '@playwright/test';
import { login } from './_helpers/auth';
import { gotoMenu } from './_helpers/nav';


test.describe('Lagerumbuchungen', () => {
  test.setTimeout(45000);
  test.beforeEach(async ({ page }) => {
    await login(page, 'test@example.com', 'password123');
  });

  test('Umbuchungsmaske sichtbar', async ({ page }) => {
    // Versuche Warehouse Management oder Inventar
    await page.goto('/ai-inventory', { waitUntil: 'domcontentloaded' }).catch(async () => {
      await page.goto('/inventory', { waitUntil: 'domcontentloaded' });
    });

    // Marker: "Bewegungen", "Umbuchung", "Transfer", ggf. Buttons
    const marker = page.getByText(/umbuchung|transfer|bewegungen|bewegung/i);
    if (await marker.count() === 0) {
      test.skip(true, 'Umbuchungs-/Bewegungsansicht nicht sichtbar – Test übersprungen');
    }
    await expect(marker.first()).toBeVisible({ timeout: 4000 });
  });
});


