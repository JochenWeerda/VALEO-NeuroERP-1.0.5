import { test, expect } from '@playwright/test';

test.describe('A11y & Responsive (Smoke)', () => {
  test('Viewport-Wechsel ohne Layoutbruch', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="app-shell"]', { state: 'visible', timeout: 30000 });
    const app = page.getByTestId('app-shell');
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(app).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(app).toBeVisible();
  });
});
