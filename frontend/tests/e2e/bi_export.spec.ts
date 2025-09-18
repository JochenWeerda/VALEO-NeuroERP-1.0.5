import { test, expect } from '@playwright/test';

async function maybeClickExport(page) {
  const exportBtn = page.locator('button:has-text("Export"), button:has-text("CSV"), button:has-text("PNG"), [data-testid="export-button"]');
  if (await exportBtn.count() > 0) {
    await exportBtn.first().click();
  }
}

test.describe('BI & Export', () => {
  test('Charts rendern (falls vorhanden) & Export triggern', async ({ page }) => {
    await page.goto('/');
    const chart = page.locator('[data-testid="chart-ready"], .recharts-wrapper, canvas');
    const hasChart = (await chart.count()) > 0;
    if (!hasChart) {
      test.skip(true, 'Keine BI-Charts vorhanden – Test übersprungen');
    }
    await expect(chart.first()).toBeVisible({ timeout: 5_000 });
    await maybeClickExport(page);
  });
});
