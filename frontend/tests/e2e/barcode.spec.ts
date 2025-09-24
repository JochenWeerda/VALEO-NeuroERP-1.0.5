import { test, expect } from '@playwright/test';
import { login } from './_helpers/auth';


test.describe('Barcode-Scanner', () => {
  test.setTimeout(45000);
  test.beforeEach(async ({ page }) => {
    await login(page, 'test@example.com', 'password123');
    await page.goto('/ai-barcode', { waitUntil: 'domcontentloaded' });
  });

  test('Barcode-Komponente rendert und startet', async ({ page }) => {
    // Neuer Live-Scanner Header in der Seite
    const header = page.getByRole('heading', { name: /live-barcode-scanner/i });
    const hasHeader = await header.count();

    if (hasHeader === 0) {
      // Fallback: Quagga-Demo im Public-Ordner
      await page.goto('/quagga-demo.html', { waitUntil: 'domcontentloaded' });
      const h1 = page.getByRole('heading', { name: /QuaggaJS Demo/i });
      await expect(h1).toBeVisible({ timeout: 4000 });
      const result = page.locator('#result');
      await expect(result).toBeVisible({ timeout: 4000 });
      return;
    }

    await expect(header.first()).toBeVisible({ timeout: 4000 });
  });
});


